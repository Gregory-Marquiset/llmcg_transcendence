#!/bin/sh
set -u

# -----------------------------
# Config (override via env)
# -----------------------------
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
ENV_FILE="${ENV_FILE:-.env}"

# 6 minutes = 360s
INTERVAL_SEC="${INTERVAL_SEC:-360}"

# après restart, on attend 90s puis on re-teste
RECHECK_AFTER_RESTART_SEC="${RECHECK_AFTER_RESTART_SEC:-90}"

# où écrire les logs
LOG_FILE="${LOG_FILE:-./tests/logs_watchdog.log}"

# liste des services à surveiller (override possible)
SERVICES="${SERVICES:-postgres gateway auth-service chat-service users-service statistics-service gdpr-service frontend project_health}"

# -----------------------------
# Helpers
# -----------------------------
ts() { date '+%Y-%m-%d %H:%M:%S'; }

log_line()
{
  # <timestamp> | ...
  printf '%s | %s\n' "$(ts)" "$1" >> "$LOG_FILE"
}

compose()
{
  # docker compose --env-file .env -f docker-compose.yml ...
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
  # healthy = ok ; tout le reste = ko (starting/unhealthy/no-container/no-healthcheck/unknown)
  [ "$1" = "healthy" ]
}

restart_service()
{
  svc="$1"
  compose restart "$svc" >/dev/null 2>&1
}

check_all_services()
{
  # print "ok" si tout est ok, sinon print "ko <service>"
  for svc in $SERVICES; do
    st="$(health_of "$svc")"
    if ! is_ok_health "$st"; then
      echo "ko $svc $st"
      return 0
    fi
  done
  echo "ok"
  return 0
}

# -----------------------------
# Main
# -----------------------------
# petit garde-fou pour éviter 2 watchdogs
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
    ko\ *)
      # result: "ko <svc> <status>"
      svc="$(printf '%s' "$result" | awk '{print $2}')"
      st="$(printf '%s' "$result" | awk '{print $3}')"

      log_line "watchdog health check: ko $svc (docker_health=$st) -> restart"
      if restart_service "$svc"; then
        sleep "$RECHECK_AFTER_RESTART_SEC"

        # recheck immédiat
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
    *)
      log_line "watchdog health check: ko unknown (unexpected_result=$result)"
      ;;
  esac

  sleep "$INTERVAL_SEC"
done
