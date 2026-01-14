#!/bin/sh

SELF="${TEST_FILE:-$0}"
NAME="${SELF##*/}"
T_DIR="$(CDPATH= cd -- "$(dirname -- "$SELF")" && pwd)"

ROOT="$T_DIR/.."

LOG_LIB_FILE="$ROOT/lib/lib.sh"
. "$LOG_LIB_FILE"

local_init

net_exists "net_database"

net_exists "net_backend"

net_exists "net_gateway"

local_resume
