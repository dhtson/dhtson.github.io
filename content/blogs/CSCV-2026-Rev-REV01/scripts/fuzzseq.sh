#!/bin/bash
# fuzzseq.sh : one message type per session after 0x72; results -> fuzzseq.res
D=/mnt/d/WSL_Ubuntu/cscv/work/rev01
touch $D/fuzzseq.res
for t in $(python3 -c "print(' '.join('%x'%t for t in range(256) if t!=0x48))"); do
  grep -q "^T $t " $D/fuzzseq.res && continue
  for try in 1 2 3; do
    read H P TL S < <(powershell.exe -NoProfile -Command "python D:\WSL_Ubuntu\cscv\work\rev01\inst.py 25000" | tr -d '\r')
    (cd /tmp && PLAN=$t timeout 90 python3 $D/takeover.py $H $P > $D/fzs.log 2>&1)
    if grep -aq "C> type" $D/fzs.log; then
      r=$(grep -a "S> " $D/fzs.log | grep -v "S>C" | tail -n +2 | tr '\n' ' ')
      echo "T $t $r" >> $D/fuzzseq.res
      echo "$r" | grep -q "0x96'" || echo "INTERESTING T $t $r"
      break
    fi
  done
done
echo FUZZ DONE
