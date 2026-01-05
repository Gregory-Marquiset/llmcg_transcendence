
# =========
# Utils
# =========

_now_ms() { date +%s%3N; }

_ansi_strip()
{
    _esc="$(printf '\033')"

    sed -e "s/${_esc}\[[0-9;]*[A-Za-z]//g"
}

_root_dir()
{
    if [ -n "${TEST_ROOT:-}" ]; then
        printf '%s' "$TEST_ROOT"
        return 0
    fi
    if [ -n "${LOG_LIB_DIR:-}" ]; then
        (CDPATH= cd -- "$LOG_LIB_DIR/.." && pwd)
        return 0
    fi
    printf '%s' "."
}

_capture_begin()
{
    [ "${CAPTURE_ACTIVE:-0}" -eq 1 ] && return 0

    command -v mkfifo >/dev/null 2>&1 || return 0
    command -v tee    >/dev/null 2>&1 || return 0

    CAPTURE_ACTIVE=1

    _tag="${1:-test}"
    _tag="$(printf '%s' "$_tag" | tr '/ ' '__')"

    RUN_ID="${RUN_ID:-$(date +%Y%m%d_%H%M%S)_$$}"
    CAPTURE_TMP="${TMPDIR:-/tmp}/ci_${RUN_ID}_${_tag}.out"
    CAPTURE_FIFO="${TMPDIR:-/tmp}/ci_${RUN_ID}_${_tag}.fifo"

    : >"$CAPTURE_TMP" 2>/dev/null || { CAPTURE_ACTIVE=0; return 0; }
    rm -f "$CAPTURE_FIFO"
    mkfifo "$CAPTURE_FIFO" 2>/dev/null || { CAPTURE_ACTIVE=0; return 0; }

    exec 3>&1 4>&2

    tee "$CAPTURE_TMP" >&3 <"$CAPTURE_FIFO" &
    CAPTURE_TEE_PID=$!

    exec >"$CAPTURE_FIFO" 2>&1
}

_capture_end()
{
    [ "${CAPTURE_ACTIVE:-0}" -eq 1 ] || return 0

    exec 1>&3 2>&4
    exec 3>&- 4>&-

    rm -f "$CAPTURE_FIFO" 2>/dev/null || true
    wait "$CAPTURE_TEE_PID" 2>/dev/null || true

    CAPTURE_ACTIVE=0
}

_fail_log_append()
{
    _rc="$1"
    [ "$_rc" -eq 1 ] || { rm -f "$CAPTURE_TMP" 2>/dev/null || true; return 0; }

    _base="$(_root_dir)"
    LOG_DIR_NAME="${RUN_ID:-$(date +%Y%m%d_%H%M%S)_$$}"
    LOG_DIR="$_base/logs/${LOG_DIR_NAME}"
    FAIL_LOG="$LOG_DIR/fail.log"

    mkdir -p "$LOG_DIR" 2>/dev/null || { rm -f "$CAPTURE_TMP" 2>/dev/null || true; return 0; }

    {
        printf '\n===== FAIL: %s | %s =====\n' "${NAME:-unknown}" "$(date '+%Y-%m-%d %H:%M:%S')"
        _ansi_strip <"$CAPTURE_TMP"
    } >>"$FAIL_LOG"

    rm -f "$CAPTURE_TMP" 2>/dev/null || true
}

global_init()
{
    RUN_ID="${RUN_ID:-$(date +%Y%m%d_%H%M%S)_$$}"
    G_EPOCH="$(_now_ms)"
    G_COUNT=0
    G_OK=0
    G_PASS=0
    G_KO=0
    G_FAIL=0
    G_SKIP=0
    G_ERRNO=0
}

local_init()
{
    _capture_begin "$NAME"
    L_EPOCH="$(_now_ms)"
    L_COUNT=0
    L_OK=0
    L_KO=0
    L_SKIP=0
    L_ERRNO=0

    ret; separator; ret; ret
    info "→ RUN $NAME"
    ret
}

local_resume()
{
    _end="$(_now_ms)"
    _dur=$((_end - L_EPOCH))

    _ms=$((_dur % 1000))
    _sec=$(((_dur / 1000) % 60))
    _min=$((_dur / 60000))

    if [ "$_min" -gt 0 ]; then
        _dur_str="${_min}m${_sec}s${_ms}ms"
    elif [ "$_sec" -gt 0 ]; then
        _dur_str="${_sec}s${_ms}ms"
    else
        _dur_str="${_ms}ms"
    fi

    if [ "$L_COUNT" -eq 0 ] || { [ "$L_OK" -eq 0 ] && [ "$L_KO" -eq 0 ]; }; then
        skiped "script skipped ($_dur_str)"
        ret; separator; ret; ret
        G_ERRNO=2
    else
        G_OK=$((G_OK + L_OK))
        G_KO=$((G_KO + L_KO))

        if [ "$L_KO" -eq 0 ]; then
            pass "TOTAL: $L_COUNT  OK: $L_OK  KO: $L_KO  ($_dur_str)"
            ret; separator; ret; ret
            G_ERRNO=0
        else
            fail "TOTAL: $L_COUNT  OK: $L_OK  KO: $L_KO  ($_dur_str)"
            ret; separator; ret; ret
            G_ERRNO=1
        fi
    fi

    _capture_end
    _fail_log_append "$G_ERRNO"
    if [ "$G_ERRNO" -eq "1" ]; then
        separator; ret;
        info "Fail logs dir: " $LOG_DIR_NAME
        separator; ret
    fi

    return "$G_ERRNO"
}

global_resume()
{
    _end_ms="$(_now_ms)"
    _start_ms="${G_EPOCH:-$_end_ms}"
    _dur_ms=$((_end_ms - _start_ms))

    _min=$((_dur_ms / 60000))
    _sec=$(((_dur_ms / 1000) % 60))
    _ms=$((_dur_ms % 1000))

    if [ "$_min" -gt 0 ]; then
        _dur_str="${_min}m${_sec}s${_ms}ms"
    elif [ "$_sec" -gt 0 ]; then
        _dur_str="${_sec}s${_ms}ms"
    else
        _dur_str="${_ms}ms"
    fi

    ret; separator; ret

    if [ "$G_FAIL" -eq 0 ]; then
        validate    "TOTAL: $G_COUNT  PASS: $G_PASS  FAIL: $G_FAIL  SKIP: $G_SKIP  OK: $G_OK KO: $G_KO  ($_dur_str)"
        separator; ret; ret
        exit 0
    else
        failed      "TOTAL: $G_COUNT  PASS: $G_PASS  FAIL: $G_FAIL  SKIP: $G_SKIP  OK: $G_OK KO: $G_KO  ($_dur_str)"
        separator; ret; ret
        exit 1
    fi
}

skip() { L_SKIP=$((L_SKIP + 1)); }

require_cmd()
{
    command -v "$1" >/dev/null 2>&1 || fail "Commande manquante: $1"
}
