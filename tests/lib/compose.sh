
# =========
# Compose
# =========

# v -> imprime la reponse

COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# creer la cmd compose
compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

# compose_config [v]
compose_config()
{
    L_COUNT=$((L_COUNT + 1))
    logs compose config

    if [ "$1" = "v" ]; then
        if compose config; then
            ok compose config valid
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko compose config invalid
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    else
        if compose config > /dev/null 2>&1; then
            ok compose config valid
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko compose config invalid
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    fi
}

# compose_build [v]
compose_build()
{
    L_COUNT=$((L_COUNT + 1))
    logs compose build

    if [ "$1" = "v" ]; then
        if compose build --no-cache; then
            ok compose build valid
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko compose build invalid
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    else
        if compose build --no-cache > /dev/null 2>&1; then
            ok compose build valid
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko compose build invalid
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    fi
}

# compose_up [v]
compose_up()
{
    L_COUNT=$((L_COUNT + 1))
    logs compose up

    if [ "$1" = "v" ]; then
        if compose up -d --build --remove-orphans; then
            ok compose up valid
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko compose up invalid
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    else
        if compose up -d --build --remove-orphans > /dev/null 2>&1; then
            ok compose up valid
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko compose up invalid
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    fi
}

# compose_down [v]
compose_down()
{
    L_COUNT=$((L_COUNT + 1))
    logs compose down

    if [ "$1" = "v" ]; then
        if compose down -v --remove-orphans; then
            ok compose down valid
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko compose down invalid
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    else
        if compose down -v --remove-orphans > /dev/null 2>&1; then
            ok compose down valid
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko compose down invalid
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    fi
}

# retourne le container id d'un service
compose_cid() { compose ps -q "$1"; }

# retourne le health status
compose_health_status()
{
    svc="$1"

    cid="$(compose_cid "$svc")"
    if [ -z "$cid" ]; then
        echo "no-container"
        return 1
    fi

    status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$cid" 2>/dev/null || true)"
    if [ -z "$status" ]; then
        echo "unknown"
        return 1
    fi

    echo "$status"
    return 0
}


# compose_wait_healthy [v] <service> [timeout]
compose_wait_healthy()
{
    if [ "$1" = "v" ]; then
        verbose="$1"
        svc="$2"
        _timeout="${3:-60}"
    else
        verbose=""
        svc="$1"
        _timeout="${2:-60}"
    fi

    L_COUNT=$((L_COUNT + 1))
    logs compose wait_healthy "$svc"

    _i=1
    while [ "$_i" -le "$_timeout" ]; do
        status="$(compose_health_status "$svc" || true)"

        if [ "$status" = "healthy" ]; then
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ok "$svc" healthy "(${_i}s)"
            ret
            return 0
        fi

        if [ "$status" = "no-container" ]; then
            [ "$verbose" = "v" ] && compose ps || true
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ko "$svc" no-container
            ret
            return 1
        fi

        cid="$(compose_cid "$svc")"
        if [ -n "$cid" ]; then
            running="$(docker inspect -f '{{.State.Running}}' "$cid" 2>/dev/null || echo "false")"
            if [ "$running" != "true" ]; then
                [ "$verbose" = "v" ] && docker inspect "$cid" || true
                L_KO=$((L_KO + 1))
                L_ERRNO=1
                ko "$svc" "not-running (status=$status)"
                ret
                return 1
            fi
        fi

        warn "[$svc] health=$status (${_i}/${_timeout})"
        _i=$((_i + 1))
        sleep 1
    done

    if [ "$verbose" = "v" ]; then
        compose logs --tail=80 "$svc"
    fi
    L_KO=$((L_KO + 1))
    L_ERRNO=1
    ko "$svc" "timeout waiting healthy"
    ret
    return 1
}
