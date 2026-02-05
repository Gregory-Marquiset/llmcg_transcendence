#!/bin/sh
set -u

# -----------------------------
# Config (override via env)
# -----------------------------
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
ENV_FILE="${ENV_FILE:-.env}"

INTERVAL_SEC="${INTERVAL_SEC:-60}"

RECHECK_AFTER_RESTART_SEC="${RECHECK_AFTER_RESTART_SEC:-30}"

LOG_FILE="${LOG_FILE:-./tests/logs_watchdog.log}"

SERVICES="${SERVICES:-postgres gateway auth-service chat-service users-service statistics-service gdpr-service frontend project_health}"

WAIT_AFTER_RESTART_SEC="${WAIT_AFTER_RESTART_SEC:-60}"
WAIT_STEP_SEC="${WAIT_STEP_SEC:-5}"

# -----------------------------
# Helpers
# -----------------------------
ts() { date '+%Y-%m-%d %H:%M:%S'; }

log_line()
{
  printf '%s | %s\n' "$(ts)" "$1" >> "$LOG_FILE"
}

compose()
{
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

cid_of()
{
  compose ps -q "$1" 2>/dev/null || true
}

health_of()
{
  svc="$1"
  cid="$(cid_of "$svc")"
  [ -n "$cid" ] || { echo "no-container"; return 0; }

  st="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$cid" 2>/dev/null || true)"
  [ -n "$st" ] || { echo "unknown"; return 0; }

  echo "$st"
}

is_ok_health()
{
  [ "$1" = "healthy" ]
}

restart_service()
{
  svc="$1"
  compose restart "$svc" >/dev/null 2>&1
}

check_all_services()
{
  for svc in $SERVICES; do
    st="$(health_of "$svc")"

    case "$st" in
      healthy)
        ;;
      starting)
        echo "wait $svc $st"
        return 0
        ;;
      *)
        echo "ko $svc $st"
        return 0
        ;;
    esac
  done
  echo "ok"
  return 0
}

wait_healthy()
{
  svc="$1"
  waited=0
  while [ "$waited" -lt "$WAIT_AFTER_RESTART_SEC" ]; do
    st="$(health_of "$svc")"
    [ "$st" = "healthy" ] && return 0
    sleep "$WAIT_STEP_SEC"
    waited=$((waited + WAIT_STEP_SEC))
  done
  return 1
}

# -----------------------------
# Main
# -----------------------------
LOCK_FILE="${LOCK_FILE:-/tmp/watchdog.lock}"
if [ -f "$LOCK_FILE" ]; then
  oldpid="$(cat "$LOCK_FILE" 2>/dev/null || true)"
  if [ -n "$oldpid" ] && kill -0 "$oldpid" 2>/dev/null; then
    log_line "watchdog already running (pid=$oldpid) -> exit"
    exit 0
  fi
fi
echo "$$" > "$LOCK_FILE" 2>/dev/null || true

log_line "watchdog started (interval=${INTERVAL_SEC}s, recheck_after_restart=${RECHECK_AFTER_RESTART_SEC}s)"
log_line "services: $SERVICES"

while :; do
  result="$(check_all_services)"

  case "$result" in
    ok)
      log_line "watchdog health check: ok"
      ;;
    wait\ *)
      svc="$(printf '%s' "$result" | awk '{print $2}')"
      st="$(printf '%s' "$result" | awk '{print $3}')"
      log_line "watchdog health check: waiting $svc (docker_health=$st)"
      ;;
    ko\ *)
      svc="$(printf '%s' "$result" | awk '{print $2}')"
      st="$(printf '%s' "$result" | awk '{print $3}')"

      log_line "watchdog health check: ko $svc (docker_health=$st) -> restart"

      if restart_service "$svc"; then
        # Attente active: on laisse Docker le temps de repasser healthy
        if wait_healthy "$svc"; then
          log_line "watchdog post-restart wait: $svc became healthy"
        else
          log_line "watchdog post-restart wait: timeout ($svc still not healthy, docker_health=$(health_of "$svc"))"
        fi

        # Recheck global après le restart (et la phase d'attente)
        result2="$(check_all_services)"
        if [ "$result2" = "ok" ]; then
          log_line "watchdog post-restart recheck: ok"
        else
          svc2="$(printf '%s' "$result2" | awk '{print $2}')"
          st2="$(printf '%s' "$result2" | awk '{print $3}')"
          log_line "watchdog post-restart recheck: ko $svc2 (docker_health=$st2)"
        fi
      else
        log_line "watchdog restart failed: $svc"
      fi
      ;;
  esac

  sleep "$INTERVAL_SEC"
done
