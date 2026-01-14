
# =========
# Request
# =========

# v -> imprime la reponse
_code_match()
{
    expected="$1"
    actual="$2"

    actual="$(printf '%s' "$actual" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

    if printf '%s' "$expected" | grep -q "," 2>/dev/null; then
        printf '%s' "$expected" \
          | tr -d '\r' \
          | tr ',' '\n' \
          | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' \
          | grep -Fxq "$actual"
        return $?
    fi

    case "$expected" in
        [1-5]xx)
            prefix="$(printf "%s" "$expected" | cut -c1)"
            printf "%s" "$actual" | grep -q "^$prefix" 2>/dev/null
            return $?
        ;;
    esac

    expected="$(printf '%s' "$expected" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [ "$expected" = "$actual" ]
}


# Usage: https_get [v] <url> <expected>
https_get()
{
    if [ "${1:-}" = "v" ]; then
        verbose="v"
        url="$2"
        expected="${3:-200}"
    else
        verbose=""
        url="$1"
        expected="${2:-200}"
    fi

    L_COUNT=$((L_COUNT + 1))
    logs https GET "$url" "expect=$expected"

    if [ "$verbose" = "v" ]; then
        tmp_h="/tmp/https_get_headers.$$"
        tmp_b="/tmp/https_get_body.$$"

        code="$(curl -sS -D "$tmp_h" -o "$tmp_b" -w '%{http_code}' "$url" 2>/dev/null || echo "000")"

        echo "---- HEADERS ----"
        cat "$tmp_h" 2>/dev/null || true

        echo "---- BODY (head) ----"
        head -n 120 "$tmp_b" 2>/dev/null || true
    else
        code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")"
    fi

    if _code_match "$expected" "$code"; then
        ok https GET "code=$code"
        L_OK=$((L_OK + 1))
        L_ERRNO=0
        [ "$verbose" = "v" ] && rm -f "$tmp_h" "$tmp_b" 2>/dev/null || true
        ret
        return 0
    fi

    ko https GET "code=$code (expected=$expected)"
    L_KO=$((L_KO + 1))
    L_ERRNO=1
    [ "$verbose" = "v" ] && rm -f "$tmp_h" "$tmp_b" 2>/dev/null || true
    ret
    return 1
}

#   https_post [v][t] <url> <expected> <data>
https_post()
{
    flags=""
    verbose=""
    want_token=""

    case "${1:-}" in
        v|t|vt|tv)
            flags="$1"
            shift
            ;;
    esac

    echo "$flags" | grep -q "v" && verbose="1"
    echo "$flags" | grep -q "t" && want_token="1"

    url="$1"
    expected="${2:-200}"
    data="$3"

    L_COUNT=$((L_COUNT + 1))
    logs https POST "$url" "expect=$expected"

    if [ -z "${data:-}" ]; then
        ko https POST "missing data"
        L_KO=$((L_KO + 1))
        L_ERRNO=1
        ret
        return 1
    fi

    tmpfile="$(mktemp)"

    if [ -n "$verbose" ]; then
        http_code="$(curl -v --silent --show-error -o "$tmpfile" -w '%{http_code}' \
            -H 'Content-Type: application/json' -d "$data" "$url")" || {
            body="$(cat "$tmpfile" 2>/dev/null)"
            rm -f "$tmpfile"
            ko https POST "curl failed"
            [ -n "$body" ] && echo "$body"
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        }
    else
        http_code="$(curl --silent --show-error -o "$tmpfile" -w '%{http_code}' \
            -H 'Content-Type: application/json' -d "$data" "$url")" || {
            body="$(cat "$tmpfile" 2>/dev/null)"
            rm -f "$tmpfile"
            ko https POST "curl failed"
            [ -n "$body" ] && echo "$body"
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        }
    fi

    body="$(cat "$tmpfile")"
    rm -f "$tmpfile"

    if [ -n "$want_token" ]; then
        token="$(printf '%s' "$body" \
            | sed -n 's/.*"access_token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
        if [ -n "$token" ]; then
            UI_TOKEN="$token"
        fi
    fi

    if ! _code_match "$expected" "$http_code"; then
        ko https POST "http_code=$http_code expected=$expected"
        L_KO=$((L_KO + 1))
        L_ERRNO=1
        ret
        return 1
    fi

    ok https POST "http_code=$http_code"
    L_OK=$((L_OK + 1))
    L_ERRNO=0
    ret
    return 0
}
