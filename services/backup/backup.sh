#!/usr/bin/env bash
set -euo pipefail

# -------- Config via env --------
BACKUP_DIR="${BACKUP_DIR:-/backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"
KEEP_LAST="${KEEP_LAST:-50}"
TZ="${TZ:-UTC}"
DATABASE_URL="${DATABASE_URL:-}"

if [[ -z "${DATABASE_URL}" ]]; then
  : "${POSTGRES_USER:?POSTGRES_USER missing}"
  : "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD missing}"
  : "${POSTGRES_DB:?POSTGRES_DB missing}"
  POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
  POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  export PGPASSWORD="${POSTGRES_PASSWORD}"
  DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=disable"
fi

mkdir -p "${BACKUP_DIR}"

ts="$(TZ="${TZ}" date +'%Y-%m-%d_%H-%M-%S')"
outfile="${BACKUP_DIR}/postgres_${ts}.dump.gz"

echo "[backup] starting -> ${outfile}"
pg_dump "${DATABASE_URL}" -Fc | gzip -c > "${outfile}"

if [[ ! -s "${outfile}" || $(stat -c%s "${outfile}") -lt 200 ]]; then
  echo "[backup] ERROR: backup file too small -> removing"
  rm -f "${outfile}"
  exit 1
fi

echo "[backup] done"
echo "[backup] rotating (KEEP_DAYS=${KEEP_DAYS}, KEEP_LAST=${KEEP_LAST})"

find "${BACKUP_DIR}" -type f -name "postgres_*.dump.gz" -mtime +"${KEEP_DAYS}" -print -delete || true

mapfile -t files < <(ls -1t "${BACKUP_DIR}"/postgres_*.dump.gz 2>/dev/null || true)
if (( ${#files[@]} > KEEP_LAST )); then
  for ((i=KEEP_LAST; i<${#files[@]}; i++)); do
    rm -f "${files[$i]}" || true
  done
fi

echo "[backup] ok"
