#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
ENV_FILE="${ENV_FILE:-.env}"

PG_VOLUME="${PG_VOLUME:-llmcg_transcendence_postgresql_data}"

PG_CONTAINER="${PG_CONTAINER:-llmcg_transcendence-postgres-1}"

TAG="${TAG:-drtest_$(date +%Y%m%d_%H%M%S)}"

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

say() { printf "\n\033[1m==> %s\033[0m\n" "$*"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing command: $1"; exit 1; }
}

wait_postgres_healthy() {
  local tries=60
  say "Waiting postgres to be healthy (container=$PG_CONTAINER)"
  for _ in $(seq 1 "$tries"); do
    if docker inspect -f '{{.State.Health.Status}}' "$PG_CONTAINER" 2>/dev/null | grep -q healthy; then
      echo "Postgres is healthy."
      return 0
    fi
    sleep 1
  done
  echo "Postgres did not become healthy in time."
  docker logs "$PG_CONTAINER" || true
  return 1
}

psql_exec() {
  docker exec -i "$PG_CONTAINER" sh -lc '
    set -eu
    : "${POSTGRES_USER:?missing}"
    : "${POSTGRES_DB:?missing}"
    psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"
  '
}

main() {
  require_cmd docker

  say "Sanity: show current compose status"
  compose ps || true

  say "Bring up postgres only (clean DB scenario is managed by volume removal later)"
  compose up -d postgres

  wait_postgres_healthy

  say "Seed DB with table + rows (TAG=$TAG)"
  cat <<SQL | psql_exec
CREATE TABLE IF NOT EXISTS dr_seed(
  id SERIAL PRIMARY KEY,
  tag TEXT NOT NULL,
  msg TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO dr_seed(tag, msg) VALUES
  ('$TAG', 'hello backup'),
  ('$TAG', 'hello restore');
SELECT COUNT(*) AS seeded_rows FROM dr_seed WHERE tag='$TAG';
SQL

  say "Run backup (make backup)"
  make backup

  say "List backups"
  make backups-ls

  say "Cleanup corrupted backups (<200 bytes) if any"
  compose run --rm backup sh -lc 'find /backups -type f -name "postgres_*.dump.gz" -size -200c -print -delete || true'

  say "Verify there is at least one backup"
  compose run --rm backup sh -lc 'ls -1t /backups/postgres_*.dump.gz | head -n 1'

  say "Simulate disaster: stop stack and DELETE postgres volume ($PG_VOLUME)"
  compose down
  docker volume rm "$PG_VOLUME"

  say "Start postgres again (new empty volume)"
  compose up -d postgres
  wait_postgres_healthy

  say "Restore latest backup"
  make restore

  say "Verify restored data exists for TAG=$TAG"
  restored_count="$(
    cat <<SQL | docker exec -i "$PG_CONTAINER" sh -lc '
      set -eu
      : "${POSTGRES_USER:?missing}"
      : "${POSTGRES_DB:?missing}"
      psql -tA -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"
    ' | tail -n 1
SELECT COUNT(*) FROM dr_seed WHERE tag='$TAG';
SQL
  )"

  if [[ "${restored_count}" != "2" ]]; then
    echo "❌ DR TEST FAILED: expected 2 rows, got '${restored_count}'"
    echo "Dumping table head:"
    cat <<SQL | psql_exec || true
SELECT * FROM dr_seed ORDER BY id DESC LIMIT 10;
SQL
    exit 1
  fi

  echo "✅ DR TEST OK: restored_count=${restored_count}"

  say "Bring full stack back up"
  compose up -d

  say "DONE"
}

main "$@"
