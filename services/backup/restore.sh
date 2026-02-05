#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
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

target="${1:-latest}"

if [[ "${target}" == "latest" ]]; then
  file="$(ls -1t "${BACKUP_DIR}"/postgres_*.dump.gz 2>/dev/null | head -n 1 || true)"
else
  if [[ -f "${target}" ]]; then
    file="${target}"
  else
    file="${BACKUP_DIR}/${target}"
  fi
fi

if [[ -z "${file}" || ! -f "${file}" ]]; then
  echo "[restore] backup not found. existing files:"
  ls -lah "${BACKUP_DIR}" || true
  exit 1
fi

echo "[restore] using: ${file}"

gunzip -c "${file}" | pg_restore --no-owner --no-privileges -c --if-exists -d "${DATABASE_URL}"

echo "[restore] ok"
