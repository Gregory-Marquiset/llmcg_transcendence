#!/bin/sh

SELF="${TEST_FILE:-$0}"
NAME="${SELF##*/}"
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

TEST_ROOT="$DIR"

LOG_LIB_FILE="$DIR/lib/lib.sh"
. "$LOG_LIB_FILE"

global_init

require_cmd curl
require_cmd grep

ret; separator; ret
launch "Run tests from $NAME"
separator; ret

for _t in "$DIR"/*/[0-9][0-9]_*__*.sh; do
	[ -f "$_t" ] || continue

	case "$_t" in
		*/00_compose/*) continue ;;
	esac

	G_COUNT=$((G_COUNT + 1))

	TEST_FILE="$_t"
	. "$_t"
	unset TEST_FILE

	if [ "$G_ERRNO" -eq 0 ]; then
		G_PASS=$((G_PASS + 1))
	elif [ "$G_ERRNO" -eq 1 ]; then
		G_FAIL=$((G_FAIL + 1))
	elif [ "$G_ERRNO" -eq 2 ]; then
		G_SKIP=$((G_SKIP + 1))
	else
		G_FAIL=$((G_FAIL + 1))
	fi
done


if [ "$G_COUNT" -eq 0 ]; then
	warn "Aucun test trouvé."
	exit 0
fi

global_resume
