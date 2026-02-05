
# =========
# HTTP
# =========

# v -> imprime la reponse

# wait_http [v] [URL] [max_tries] [sleep_sec]
wait_http()
{
    L_COUNT=$((L_COUNT + 1))
    logs wait http test

    if [ "$1" = "v" ]; then
        _url="$2"
        _max="${3:-30}"
        _pause="${4:-1}"
    else
        _url="$1"
        _max="${2:-30}"
        _pause="${3:-1}"
    fi

    _i=1
    if [ "$1" = "v" ]; then
        while [ "$_i" -le "$_max" ]; do
            if curl -fsS "$_url"; then
                ret
                ok "http up: $_url"
                L_OK=$((L_OK + 1))
                L_ERRNO=0
                ret
                return 0
            fi
            warn "Attente http: $_url (${_i}/${_max})"
            _i=$((_i + 1))
            sleep "$_pause"
        done
    else
        while [ "$_i" -le "$_max" ]; do
            if curl -fsS "$_url" >/dev/null 2>&1; then
                ok "http up: $_url"
                L_OK=$((L_OK + 1))
                L_ERRNO=0
                ret
                return 0
            fi
            warn "Attente http: $_url (${_i}/${_max})"
            _i=$((_i + 1))
            sleep "$_pause"
        done
    fi
    ko "Timeout: $_url ne répond pas"
    L_KO=$((L_KO + 1))
    L_ERRNO=1
    ret
    return 1
}

# http_get_body URL [v] [URL] -> GET le body
http_get_body()
{
    L_COUNT=$((L_COUNT + 1))
    logs body http test

    if [ "$#" -ne 2 ]; then
        _body="$1"
    else
        _body="$2"
    fi

    if [ "$1" = "v" ]; then
        if curl -fsS "$_body"; then
            ret
            ok "GET body successful: $_body"
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ret
            ko "GET body failed: $_body"
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    else
        if curl -fsS "$_body" >/dev/null; then
            ok "GET body successful: $_body"
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko "GET body failed: $_body"
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    fi
}

# http_get_headers [v] [URL] -> GET le header
http_get_headers()
{
    L_COUNT=$((L_COUNT + 1))
    logs headers http test

    if [ "$#" -ne 2 ]; then
        _head="$1"
    else
        _head="$2"
    fi

    if [ "$1" = "v" ]; then
        if curl -fIsS "$_head"; then
            ok "headers GET successful: $_head"
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko "headers GET failed: $_head"
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    else
        if curl -fIsS "$_head" >/dev/null; then
            ok "headers GET successful: $_head"
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko "headers GET failed: $_head"
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    fi
}

#   http_get_health [v] <base_url_or_health_url>
# Examples:
#   http_get_health http://localhost:5000
#   http_get_health http://localhost:5000/health
#   http_get_health v http://localhost:5000
http_get_health()
{
    L_COUNT=$((L_COUNT + 1))
    logs health http test

    if [ "$1" = "v" ]; then
        verbose="v"
        _health="${2:-}"
    else
        verbose=""
        _health="${1:-}"
    fi

    if [ -z "$_health" ]; then
        ko "health check failed: missing url"
        L_KO=$((L_KO + 1))
        L_ERRNO=1
        ret
        return 1
    fi

    case "$_health" in
        */health|*/health/) : ;;
        */) _health="${_health}health" ;;
        *)  _health="${_health}/health" ;;
    esac

    if [ "$verbose" = "v" ]; then
        if curl -fsS "$_health"; then
            ret
            ok "health check successful: $_health"
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        fi
    else
        if curl -fsS "$_health" >/dev/null 2>&1; then
            ok "health check successful: $_health"
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        fi
    fi

    ko "health check failed: $_health"
    L_KO=$((L_KO + 1))
    L_ERRNO=1
    ret
    return 1
}
