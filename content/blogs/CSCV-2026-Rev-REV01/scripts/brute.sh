#!/bin/bash
# Orchestrator: loop instances; NW parallel workers per instance until all candidates done or HIT.
D=/mnt/d/WSL_Ubuntu/cscv/work/rev01
CF=${1:-$D/cands.txt}; NW=${2:-8}; ROUNDS=${3:-200}
for r in $(seq 1 $ROUNDS); do
  [ -f $D/HIT.txt ] && { echo "HIT found"; cat $D/HIT.txt; exit 0; }
  left=$(awk 'NR==FNR{d[$0]=1;next} !($0 in d)' $D/done.txt $CF | wc -l)
  [ "$left" = "0" ] && { echo "all candidates done, no hit"; exit 1; }
  read H P T S < <(powershell.exe -NoProfile -Command "python D:\\WSL_Ubuntu\\cscv\\work\\rev01\\inst.py 100000" | tr -d '\r')
  [ -z "$P" ] && { echo "instance fail"; sleep 5; continue; }
  DL=$(python3 -c "import time;print(time.time()+${T:-100000}/1000-8)")
  echo "$(date +%T) round $r host $H left $left timeLeft $T"
  for w in $(seq 0 $((NW-1))); do
    (cd /tmp && python3 $D/worker.py $H $P $CF $w $NW $DL $D/brute_log.txt >/dev/null 2>>$D/brute_err.txt) &
  done
  wait
done
