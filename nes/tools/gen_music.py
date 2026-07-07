#!/usr/bin/env python3
"""Generate src/music.inc : NES APU period tables + a set of ORIGINAL songs,
one per stage, plus a song table the engine switches between.

All tunes are original compositions written for this game (built from common,
non-copyrightable chord progressions with invented melodies) -- none is a
transcription of any existing theme.
"""

import sys

CPU = 1789773.0

SEMI = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
        'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}

REST = 0xFF
HOLD = 0xFE


def idx(name):
    if name in ('R', None):
        return REST
    if name == '-':
        return HOLD
    note = name[:-1]
    octave = int(name[-1])
    return (octave - 2) * 12 + SEMI[note]


def freq(i):
    return 440.0 * (2.0 ** ((36 + i - 69) / 12.0))


N = 49  # C2..C6


def build_tables(n):
    plo, phi, tlo, thi = [], [], [], []
    for i in range(n):
        f = freq(i)
        p = max(0, min(2047, int(round(CPU / (16.0 * f))) - 1))
        t = max(0, min(2047, int(round(CPU / (32.0 * f))) - 1))
        plo.append(p & 0xFF); phi.append((p >> 8) & 0x07)
        tlo.append(t & 0xFF); thi.append((t >> 8) & 0x07)
    return plo, phi, tlo, thi


# ===========================================================================
#  Songs.  Each: name, tempo (frames/step), and 4 equal-length voice lists.
# ===========================================================================
SONGS = []


def song(name, tempo, mel, harm, bass, perc):
    n = len(mel)
    assert len(harm) == n and len(bass) == n and len(perc) == n, name
    SONGS.append((name, tempo, mel, harm, bass, perc))


# --- TITLE: cosy lounge jazz (ii-V-I-vi in C) ------------------------------
song('title', 14,
     ['F4', 'R', 'A4', 'C5', 'R', 'A4', 'F4', 'R',
      'B4', 'R', 'D5', 'R', 'B4', 'A4', 'G4', 'R',
      'E4', 'G4', 'B4', 'C5', 'R', 'B4', 'G4', 'R',
      'C5', 'B4', 'A4', 'G4', 'E4', 'R', 'G4', 'R'],
     ['R', 'F4', 'R', 'A4', 'R', 'C5', 'R', 'A4',
      'R', 'B4', 'R', 'F4', 'R', 'B4', 'R', 'F4',
      'R', 'E4', 'R', 'B4', 'R', 'E4', 'R', 'B4',
      'R', 'C5', 'R', 'G4', 'R', 'C5', 'R', 'G4'],
     ['D2', '-', 'A2', '-', 'D3', '-', 'F3', '-',
      'G2', '-', 'D3', '-', 'G3', '-', 'F3', '-',
      'C2', '-', 'G2', '-', 'C3', '-', 'E3', '-',
      'A2', '-', 'E3', '-', 'A3', '-', 'G3', '-'],
     [1, 1, 2, 1, 1, 1, 2, 1] * 4)

# --- PACK: tense timer groove (Am-Dm-E-Am) ---------------------------------
song('pack', 10,
     ['A4', 'R', 'C5', 'B4', 'A4', 'R', 'F4', 'R',
      'G#4', 'R', 'B4', 'R', 'A4', 'R', 'R', 'R'],
     ['R', 'E4', 'R', 'A4', 'R', 'F4', 'R', 'D4',
      'R', 'E4', 'R', 'G#4', 'R', 'E4', 'R', 'A4'],
     ['A2', '-', 'A2', '-', 'D3', '-', 'D3', '-',
      'E3', '-', 'E3', '-', 'A2', '-', 'E3', '-'],
     [1, 1, 2, 1] * 4)

# --- CROSS: bright hopping tune (C-F-G-C) ----------------------------------
song('cross', 12,
     ['C5', 'E5', 'G5', 'E5', 'A4', 'C5', 'F5', 'C5',
      'B4', 'D5', 'G5', 'D5', 'C5', 'E5', 'C5', 'R'],
     ['R', 'G4', 'R', 'C5', 'R', 'A4', 'R', 'F4',
      'R', 'B4', 'R', 'G4', 'R', 'G4', 'R', 'E4'],
     ['C3', '-', 'G2', '-', 'F2', '-', 'C3', '-',
      'G2', '-', 'D3', '-', 'C3', '-', 'G2', '-'],
     [1, 2, 1, 2] * 4)

# --- GETAWAY: driving chase (Em-C-G-D) -------------------------------------
song('getaway', 8,
     ['E5', 'R', 'D5', 'B4', 'C5', 'R', 'G4', 'R',
      'G4', 'R', 'B4', 'D5', 'D5', 'R', 'A4', 'R'],
     ['R', 'E4', 'R', 'G4', 'R', 'C4', 'R', 'E4',
      'R', 'G4', 'R', 'B4', 'R', 'D4', 'R', 'F#4'],
     ['E2', 'B2', 'E2', 'B2', 'C3', 'G3', 'C3', 'G3',
      'G2', 'D3', 'G2', 'D3', 'D3', 'A3', 'D3', 'A3'],
     [1, 1, 1, 2] * 4)

# --- BOSS: intense (Dm-Bb-C-A) ---------------------------------------------
song('boss', 7,
     ['D5', 'F5', 'A5', 'F5', 'D5', 'R', 'A#4', 'R',
      'C5', 'E5', 'G5', 'E5', 'A4', 'C#5', 'E5', 'R'],
     ['R', 'A4', 'R', 'D5', 'R', 'F4', 'R', 'A#4',
      'R', 'G4', 'R', 'C5', 'R', 'E4', 'R', 'A4'],
     ['D2', 'A2', 'D3', 'A2', 'A#2', 'F3', 'A#2', 'F3',
      'C3', 'G3', 'C3', 'G3', 'A2', 'E3', 'A2', 'C#3'],
     [2, 1, 2, 1] * 4)

# --- WIN: triumphant fanfare (C-G-C) ---------------------------------------
song('win', 12,
     ['C5', 'E5', 'G5', 'C6', 'B5', 'G5', 'C6', 'R'],
     ['R', 'C5', 'R', 'E5', 'R', 'D5', 'R', 'G5'],
     ['C3', '-', 'G2', '-', 'C3', '-', 'C3', '-'],
     [1, 1, 2, 1, 1, 1, 2, 2])

# --- OVER: somber descent (Am) ---------------------------------------------
song('over', 16,
     ['A4', 'G4', 'F4', 'E4', 'D4', 'R', 'A3', 'R'],
     ['R', 'E4', 'R', 'C4', 'R', 'A3', 'R', 'R'],
     ['A2', '-', 'E2', '-', 'A2', '-', '-', '-'],
     [0, 0, 0, 0, 0, 0, 0, 0])


def emit_bytes(fh, label, vals):
    fh.write(f'{label}:\n')
    for i in range(0, len(vals), 8):
        chunk = ', '.join(f'${v & 0xFF:02X}' for v in vals[i:i + 8])
        fh.write(f'    .byte {chunk}\n')


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'music.inc'
    plo, phi, tlo, thi = build_tables(N)
    with open(out, 'w') as fh:
        fh.write('; AUTO-GENERATED by tools/gen_music.py -- do not edit.\n')
        fh.write(f'NOTE_REST = ${REST:02X}\n')
        fh.write(f'NOTE_HOLD = ${HOLD:02X}\n')
        for i, s in enumerate(SONGS):
            fh.write(f'SONG_{s[0].upper()} = {i}\n')
        fh.write('\n')
        emit_bytes(fh, 'pulse_lo', plo)
        emit_bytes(fh, 'pulse_hi', phi)
        emit_bytes(fh, 'tri_lo', tlo)
        emit_bytes(fh, 'tri_hi', thi)
        fh.write('\n')
        for i, (name, tempo, mel, harm, bass, perc) in enumerate(SONGS):
            emit_bytes(fh, f's{i}_mel', [idx(x) for x in mel])
            emit_bytes(fh, f's{i}_harm', [idx(x) for x in harm])
            emit_bytes(fh, f's{i}_bass', [idx(x) for x in bass])
            emit_bytes(fh, f's{i}_perc', perc)
        fh.write('\n; songtab: mel/harm/bass/perc pointers, length, tempo\n')
        fh.write('songtab:\n')
        for i, (name, tempo, mel, harm, bass, perc) in enumerate(SONGS):
            n = len(mel)
            fh.write(f'    .byte <s{i}_mel,>s{i}_mel, <s{i}_harm,>s{i}_harm, '
                     f'<s{i}_bass,>s{i}_bass, <s{i}_perc,>s{i}_perc, '
                     f'{n}, {tempo}\n')
    print(f'wrote {out}: {len(SONGS)} songs, {N} notes')


if __name__ == '__main__':
    main()
