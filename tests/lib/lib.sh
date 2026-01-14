#!/bin/sh

# évite les double source
[ "${LOG_LIB_LOADED:-0}" -eq 1 ] && return 0
LOG_LIB_LOADED=1

# on exige que le caller définisse LOG_LIB_FILE avant de sourcer
: "${LOG_LIB_FILE:?LOG_LIB_FILE must be set before sourcing log_lib.sh}"

LOG_LIB_DIR="$(CDPATH= cd -- "$(dirname -- "$LOG_LIB_FILE")" && pwd)"

. "$LOG_LIB_DIR/colors.sh"
. "$LOG_LIB_DIR/logging.sh"
. "$LOG_LIB_DIR/utils.sh"

. "$LOG_LIB_DIR/http.sh"
. "$LOG_LIB_DIR/https.sh"
. "$LOG_LIB_DIR/service.sh"
. "$LOG_LIB_DIR/compose.sh"
. "$LOG_LIB_DIR/networks.sh"
. "$LOG_LIB_DIR/request.sh"
