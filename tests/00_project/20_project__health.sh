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
compose_wait_healthy project_health 90

# Endpoints /health
http_get_health "http://localhost:5173/api/v1/auth"
http_get_health "http://localhost:5173/api/v1/chat"
http_get_health "http://localhost:5173/api/v1/users"
http_get_health "http://localhost:5173/api/v1/statistics"
http_get_health "http://localhost:5173/api/v1/gdpr"

# health route
net_exists "net_backend"
net_wget_http "http://gateway:5000/health"
net_wget_http "http://auth-service:5000/health"
net_wget_http "http://users-service:5000/health"
net_wget_http "http://chat-service:5000/health"
net_wget_http "http://statistics-service:5000/health"
net_wget_http "http://gdpr-service:5000/health"

local_resume
