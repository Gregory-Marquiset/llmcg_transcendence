#!/bin/sh

SELF="${TEST_FILE:-$0}"
NAME="${SELF##*/}"
T_DIR="$(CDPATH= cd -- "$(dirname -- "$SELF")" && pwd)"

ROOT="$T_DIR/.."

LOG_LIB_FILE="$ROOT/lib/lib.sh"
. "$LOG_LIB_FILE"

local_init

# Docker healthchecks
compose_wait_healthy postgres 90
compose_wait_healthy gateway 90
compose_wait_healthy auth-service 90
compose_wait_healthy chat-service 90
compose_wait_healthy users-service 90
compose_wait_healthy statistics-service 90
compose_wait_healthy gdpr-service 90
compose_wait_healthy frontend 90

# Endpoints /health
https_get_health "https://localhost:8001/api/v1/auth"
https_get_health "https://localhost:8001/api/v1/chat"
https_get_health "https://localhost:8001/api/v1/users"
https_get_health "https://localhost:8001/api/v1/statistics"
https_get_health "https://localhost:8001/api/v1/gdpr"

local_resume
