
# =========
# Networks (tests depuis le réseau docker)
# =========

# Image légère pour exécuter wget
NET_IMAGE="alpine:3.21"

# Usage: net_exists [v] [network_name]
# Par défaut: NET_NAME
net_exists()
{
    if [ "${1:-}" = "v" ]; then
        verbose="v"
        net="${2}"
    else
        verbose=""
        net="${1}"
    fi

    L_COUNT=$((L_COUNT + 1))
    logs net exists "$net"

    if [ "$verbose" = "v" ]; then
        if docker network inspect "$net"; then
            NET_NAME="$net"
            ok "$net" exists
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko "$net" "does not exists"
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    else
        if docker network inspect "$net" >/dev/null 2>&1; then
            NET_NAME="$net"
            ok "$net" exists
            L_OK=$((L_OK + 1))
            L_ERRNO=0
            ret
            return 0
        else
            ko "$net" "does not exists"
            L_KO=$((L_KO + 1))
            L_ERRNO=1
            ret
            return 1
        fi
    fi
}


# Usage: network_run [v] <sh_command>
# Lance un conteneur éphémère sur le réseau Docker et exécute une commande sh.
network_run()
{
    if [ "${1:-}" = "v" ]; then
        verbose="v"
        shift
    else
        verbose=""
    fi

    cmd="$*"

    if ! docker network inspect "$NET_NAME" >/dev/null 2>&1; then
        return 1
    fi

    if [ "$verbose" = "v" ]; then
        docker run --rm --network "$NET_NAME" "$NET_IMAGE" sh -lc "$cmd"
    else
        docker run --rm --network "$NET_NAME" "$NET_IMAGE" sh -lc "$cmd" >/dev/null 2>&1
    fi
}


# Usage: net_wget_http [v] <url>
# Test HTTP depuis le réseau docker.
net_wget_http()
{
    if [ "${1:-}" = "v" ]; then
        verbose="v"
        url="$2"
    else
        verbose=""
        url="$1"
    fi

    L_COUNT=$((L_COUNT + 1))
    logs net wget "$url"

    if [ "$NET_NAME" = "" ]; then
        ko "valid [ net_exists <network_name> ] test first"
        L_KO=$((L_KO + 1))
        L_ERRNO=1
        ret
        return 1
    fi

    if [ "$verbose" = "v" ]; then
        cmd="apk add --no-cache wget ca-certificates >/dev/null;
             echo '--- GET $url ---';
             wget -S -O- --timeout=3 --tries=1 '$url'"
    else
        cmd="apk add --no-cache wget ca-certificates >/dev/null;
             wget -qO- --timeout=3 --tries=1 '$url' >/dev/null"
    fi

    if network_run "$verbose" "$cmd"; then
        ok "$url" ok
        L_OK=$((L_OK + 1))
        L_ERRNO=0
        ret
        return 0
    else
        ko "$url" fail
        L_KO=$((L_KO + 1))
        L_ERRNO=1
        ret
        return 1
    fi
}

# Usage: net_wget_https [v] <url>
# Test HTTPS depuis le réseau docker (sans vérifier le cert).
net_wget_https()
{
    if [ "${1:-}" = "v" ]; then
        verbose="v"
        url="$2"
    else
        verbose=""
        url="$1"
    fi

    L_COUNT=$((L_COUNT + 1))
    logs net wget_https "$url"

    if [ "$NET_NAME" = "" ]; then
        ko "valid [ net_exists <network_name> ] test first"
        L_KO=$((L_KO + 1))
        L_ERRNO=1
        ret
        return 1
    fi

   if [ "$verbose" = "v" ]; then
        cmd="apk add --no-cache wget ca-certificates >/dev/null;
             echo '--- GET (HTTPS) $url ---';
             wget -S -O- --timeout=3 --tries=1 --no-check-certificate '$url'"
    else
        cmd="apk add --no-cache wget ca-certificates >/dev/null;
             wget -qO- --timeout=3 --tries=1 --no-check-certificate '$url' >/dev/null"
    fi

    if network_run "$verbose" "$cmd"; then
        ok "$url" ok
        L_OK=$((L_OK + 1))
        L_ERRNO=0
        ret
        return 0
    else
        ko "$url" fail
        L_KO=$((L_KO + 1))
        L_ERRNO=1
        ret
        return 1
    fi
}
