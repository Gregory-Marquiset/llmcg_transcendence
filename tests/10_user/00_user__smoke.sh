#!/bin/sh

SELF="${TEST_FILE:-$0}"
NAME="${SELF##*/}"
T_DIR="$(CDPATH= cd -- "$(dirname -- "$SELF")" && pwd)"

ROOT="$T_DIR/.."

LOG_LIB_FILE="$ROOT/lib/lib.sh"
. "$LOG_LIB_FILE"

local_init

UI_USERNAME=testuser
UI_MAIL=test1@transcendence.local
UI_PASSWORD=1234
UI_TOKEN=TestToken

https_get "https://localhost:8001" 200

https_get "https://localhost:8001/signUp" 200

https_post "https://localhost:8001/api/v1/auth/register" 201,409 "{\"username\":\"$UI_USERNAME\",\"email\":\"$UI_MAIL\",\"password\":\"$UI_PASSWORD\"}"

https_get "https://localhost:8001/signIn" 200

https_post t "https://localhost:8001/api/v1/auth/login" 200 "{\"email\":\"$UI_MAIL\",\"password\":\"$UI_PASSWORD\"}"

local_resume
