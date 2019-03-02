#!/usr/bin/env bash
open_sem(){
    mkfifo pipe-$$
    exec 3<>pipe-$$
    rm pipe-$$
    local i=$1
    for((;i>0;i--)); do
        printf %s 000 >&3
    done
}

run_with_lock(){
    local x
    read -u 3 -n 3 x && ((0==x)) || exit $x
    (
     ( "$@"; )
    printf '%.3d' $? >&3
    )&
}

N=3
open_sem $N
for filename in tests/*.ts; do
    run_with_lock mocha -r ts-node/register -r tsconfig-paths/register -t 120000 $NODE_DEBUG_OPTION $filename
done
wait
