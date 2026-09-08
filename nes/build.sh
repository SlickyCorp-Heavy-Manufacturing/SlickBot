#!/usr/bin/env bash
# Build BORDER RUN into border.nes  (requires cc65: ca65 + ld65)
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p build

echo "[1/4] generating graphics (CHR)"
python3 tools/chrgen.py src/chr.bin

echo "[2/4] generating music tables"
python3 tools/gen_music.py src/music.inc

echo "[3/4] assembling"
ca65 --cpu 6502 -I src --bin-include-dir src -o build/border.o src/border.s

echo "[4/4] linking"
ld65 -C nrom.cfg -o border.nes build/border.o

ls -l border.nes
echo "done -> border.nes"
