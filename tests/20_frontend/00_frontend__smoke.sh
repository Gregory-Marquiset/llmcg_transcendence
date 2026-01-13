#!/bin/sh

SELF="${TEST_FILE:-$0}"
NAME="${SELF##*/}"
T_DIR="$(CDPATH= cd -- "$(dirname -- "$SELF")" && pwd)"

ROOT="$T_DIR/.."

LOG_LIB_FILE="$ROOT/lib/lib.sh"
. "$LOG_LIB_FILE"

local_init

https_get "http://localhost:5173" 200

https_get "http://localhost:5173/signUp" 200

https_post "http://localhost:5173/api/v1/auth/register" 201,409 "{\"username\":\"$UI_USERNAME\",\"email\":\"$UI_MAIL\",\"password\":\"$UI_PASSWORD\"}"

https_get "http://localhost:5173/signIn" 200

https_post t "http://localhost:5173/api/v1/auth/login" 200 "{\"email\":\"$UI_MAIL\",\"password\":\"$UI_PASSWORD\"}"

local_resume
