#!/usr/bin/env bash

mkdir -p ./build/
# clean
rm -f ./build/*.teal

set -e # die on error

python ./algobpy/compile.py "$1" ./build/approval.teal ./build/clear.teal
