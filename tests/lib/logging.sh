
# =========
# Logging and text edition
# =========

ret()       { printf "\n"; }
separator() { printf "${ON}${BLU}${OFF}""              ----------------------------""$RES"; }

launch()    { printf "%s" " [${ON}${MAG}${SEP}${BLINK}${OFF}"   "  LAUNCH  " "${RES}] " "$*"; ret; }
test()      { printf "%s" " [${ON}${MAG}${SEP}${BLINK}${OFF}"   "   TEST   " "${RES}] " "$*"; ret; }
info()      { printf "%s" " [${ON}${CYA}${OFF}"                 "   INFO   " "${RES}] " "$*"; ret; }
logs()      { printf "%s" " [${ON}${BLU}${OFF}"                 "   LOGS   " "${RES}] " "$*"; ret; }
warn()      { printf "%s" " [${ON}${YEL}${OFF}"                 "   WARN   " "${RES}] " "$*"; ret; }
skiped()    { printf "%s" " [${ON}${BRO}${OFF}"                 "   SKIP   " "${RES}] " "$*"; ret; }

ok()        { printf "%s" " [${ON}${GRE}${OFF}"                 "    OK    " "${RES}] " "$*"; ret; }
pass()      { printf "%s" " [${ON}${LGR}${OFF}"                 "   PASS   " "${RES}] " "$*"; ret; }
validate()  { printf "%s" " [${ON}${LGR}${SEP}${BLINK}${OFF}"   " VALIDATE " "${RES}] " "$*"; ret; }

ko()        { printf "%s" " [${ON}${LRE}${OFF}"                 "    KO    " "${RES}] " "$*"; ret; }
fail()      { printf "%s" " [${ON}${RED}${OFF}"                 "   FAIL   " "${RES}] " "$*"; ret; }
failed()    { printf "%s" " [${ON}${RED}${SEP}${BLINK}${OFF}"   "  FAILED  " "${RES}] " "$*"; ret; }

red()   { printf "%s" "${ON}${RED}m" "$*" "$RES"; }
gre()   { printf "%s" "${ON}${GRE}m" "$*" "$RES"; }
yel()   { printf "%s" "${ON}${YEL}m" "$*" "$RES"; }
blu()   { printf "%s" "${ON}${BLU}m" "$*" "$RES"; }
mag()   { printf "%s" "${ON}${MAG}m" "$*" "$RES"; }
cia()   { printf "%s" "${ON}${CYA}m" "$*" "$RES"; }
bro()   { printf "%s" "${ON}${BRO}m" "$*" "$RES"; }
bla()   { printf "%s" "${ON}${BLA}m" "$*" "$RES"; }
