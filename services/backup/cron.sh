#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
INTERVAL_SEC="${BACKUP_INTERVAL_SEC:-3600}"
JITTER_SEC="${BACKUP_JITTER_SEC:-15}"
LOCK_FILE="${BACKUP_LOCK_FILE:-/tmp/backup.lock}"
META_FILE="${BACKUP_META_FILE:-${BACKUP_DIR}/.backup_meta.json}"

mkdir -p "${BACKUP_DIR}"

now_iso() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

write_meta() {
  cat > "${META_FILE}" <<EOF
{
  "intervalSec": ${7},
  "lastOk": ${1},
  "lastFile": ${2},
  "lastSize": ${3},
  "lastError": ${4},
  "lastRunAt": ${5},
  "nextRunAt": ${6}
}
EOF
}

if [[ ! -f "${META_FILE}" ]]; then
  write_meta "null" "null" "null" "null" "\"$(now_iso)\"" "\"$(now_iso)\"" "${INTERVAL_SEC}"
fi

echo "[backup-cron] started (interval=${INTERVAL_SEC}s)"

while :; do
  start_ts="$(now_iso)"
  next_ts="$(date -u -d "@$(( $(date -u +%s) + INTERVAL_SEC ))" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || now_iso)"

  if ( set -o noclobber; echo "$$" > "${LOCK_FILE}" ) 2>/dev/null; then
    trap 'rm -f "${LOCK_FILE}"' EXIT

    set +e
    out="$((/app/backup.sh) 2>&1)"
    code=$?
    set -e

    last_ok="false"
    last_err="null"
    last_file="null"
    last_size="null"

    if [[ $code -eq 0 ]]; then
      last_ok="true"
      last="$(ls -1t "${BACKUP_DIR}"/postgres_*.dump.gz 2>/dev/null | head -n 1 || true)"
      if [[ -n "${last}" && -f "${last}" ]]; then
        last_file="\"$(basename "${last}")\""
        last_size="$(stat -c%s "${last}" 2>/dev/null || echo null)"
      fi
    else
      last_ok="false"
      esc="$(printf '%s' "${out}" | tail -n 20 | sed 's/\\/\\\\/g; s/"/\\"/g')"
      last_err="\"${esc}\""
    fi

    write_meta "${last_ok}" "${last_file}" "${last_size}" "${last_err}" "\"${start_ts}\"" "\"${next_ts}\"" "${INTERVAL_SEC}"

    rm -f "${LOCK_FILE}"
    trap - EXIT
  else
    echo "[backup-cron] locked: another backup is running, skipping"
  fi

  sleep "$(( INTERVAL_SEC + (RANDOM % (JITTER_SEC + 1)) ))"
done
