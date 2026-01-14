#!/bin/sh

SELF="${TEST_FILE:-$0}"
NAME="${SELF##*/}"
T_DIR="$(CDPATH= cd -- "$(dirname -- "$SELF")" && pwd)"

ROOT="$T_DIR/.."

LOG_LIB_FILE="$ROOT/lib/lib.sh"
. "$LOG_LIB_FILE"

local_init

# net_exists "net_backend"

# net_wget_http "http://static:8080/health"

# HTTPS="https://127.0.0.1:8443/static/"

# wait_https $HTTPS

# https_get_health $HTTPS

local_resume
