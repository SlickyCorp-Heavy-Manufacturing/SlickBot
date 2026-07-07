# BORDER RUN 🇨🇦🎮

A homebrew **NES game** (real 6502, real `.nes` ROM) about the most patriotic
crime of the console wars: smuggling a **full Sega Genesis — with Sega CD *and*
32X — across the US/Canada border, lodged firmly up your own colon.**

Waddle north through Halo-2-flavoured traffic, **Frogger**-style. Cars,
border-patrol rigs, Warthogs and moose end your run — but a **Halo-style
rechargeable energy shield** buys you a second chance. Soundtrack: an original
cosy lounge-jazz loop.

* **Genre:** Frogger + Halo 2 (grid-hop dodging, plus a recharging shield)
* **Mapper:** NROM-128 (mapper 0), 16 KB PRG + 8 KB CHR
* **Output:** `border.nes` — runs on real hardware and every major emulator

## Title & attract mode

Leave the title alone and it runs an **attract-mode** demo loop, cycling
through a preview card for each of the three stages — with animated sprites
(the console tower, traffic, the fleeing Warthog and the chopper) — before
looping back to the title. Press **START** on any screen to begin.

## Stage 1 - THE PACKING (timed placement puzzle)

Before the border run you have to physically **cram the Sega gear into a
storage grid the size of a colon** - a Resident-Evil-attache-case-style
placement puzzle against a **countdown timer**. Consoles arrive one at a time;
slide each around the grid and drop it into any empty space. Pack in as many as
you can before time runs out.

Three console pieces, each an awkward shape to seat:

| Console | Footprint |
| ------- | :-------: |
| Game Gear | 2x1 (small filler) |
| Genesis + 2 controllers on wires | 6x2, controllers jut off both sides |
| Genesis + Sega CD + 32X | 5x3 L-shape, Sega CD hangs off to the side |

The big irregular pieces are the challenge: finding a spot for the wide
controllers rig or the L-shaped tower takes real planning before the clock
runs out.

The fuller your haul, the more loot on the victory screen - but also the
**slower you waddle** on the run. Efficient packing = more gear in the time you
have.

* **D-Pad** - move the current console around the grid
* **A** - drop it into place (only where it fits)
* **B** - skip the current console (pull the next one)
* **START** - finish early and begin the run

The stage ends when the **TIME** meter hits zero or you press START. The
**SEGAS** counter tracks how many consoles you have packed.

## Controls (the run)

| Button | Action |
| ------ | ------ |
| **D-Pad** | Waddle one lane up / down / left / right |
| **START** | Begin game / continue from a screen |

Reach the checkered border at the top to cross into Canada and advance a level.
Clear all three crossings and you hit the final stage.

## Stage 3 — THE GETAWAY (side-scroller)

Border control is on you and you're barrelling into Canada. Floor the
**Warthog** north in a side-scrolling chase: the country streams by and the
hazards — **pine trees, fish, deer and the occasional hot dish** — charge in
from the right, and you **steer up and down** to weave through them. Your Halo
shield still soaks one hit before you start losing lives. Survive to fill the
**DIST** meter and you're home free.

* **D-Pad Up/Down** — steer the Warthog across the road
* Survive until the **DIST** bar fills — then the boss arrives

You're racing down a lane-marked asphalt **road**; a **treeline drifts by in
the background** while dust streaks race past on the road, so the layered
parallax sells the speed. The chase gets faster and the hazards thicker the
further you get.

### Boss — THE CHOPPER

Fill the distance meter and a **border-patrol helicopter** drops in for the
final showdown. It sweeps up and down and rains bombs on the road.

* **A** — fire the Warthog's gun (bullets shoot forward at your current height)
* **D-Pad Up/Down** — line your shots up with the chopper *and* dodge its bombs

The HUD switches to a **HELO** health bar. Empty it to blow the chopper out of
the sky and escape into Canada for good. Bombs still cost you shield then
lives — get hit with no lives left and it's game over.
Get hit with your shield up and it absorbs the blow (you're knocked back to the
start and a pip drops); the shield **fully recharges** if you stay clean for a
few seconds — pure Master Chief. Get hit with the shield down and you lose a
life. Three levels, each faster than the last.

The HUD shows `LIVES`, `LEVEL`, and your `SHIELD` pips.

---

## Building the ROM (Linux / macOS / WSL)

You need the **cc65** toolchain (`ca65` + `ld65`) and **Python 3**.

```bash
# Debian/Ubuntu:  sudo apt-get install cc65 python3
# macOS (brew):   brew install cc65
./build.sh          # -> produces border.nes
```

`build.sh` regenerates the graphics (`tools/chrgen.py` → `src/chr.bin`) and the
music tables (`tools/gen_music.py` → `src/music.inc`), then assembles and links.

---

## Building the ROM on **Windows**

1. **Install cc65.** Download the latest Windows snapshot ZIP from
   <https://cc65.github.io/> (or <https://github.com/cc65/cc65/releases>),
   unzip it to e.g. `C:\cc65`, and add `C:\cc65\bin` to your `PATH`.
2. **Install Python 3** from <https://python.org> (tick *"Add Python to PATH"*).
3. Open **PowerShell** (or *Git Bash*) in this `nes/` folder and run either:

   **Git Bash / WSL:**
   ```bash
   ./build.sh
   ```

   **PowerShell (equivalent commands):**
   ```powershell
   mkdir build -Force
   python tools\chrgen.py src\chr.bin
   python tools\gen_music.py src\music.inc
   ca65 --cpu 6502 -I src --bin-include-dir src -o build\border.o src\border.s
   ld65 -C nrom.cfg -o border.nes build\border.o
   ```

You now have `border.nes`.

> A pre-built `border.nes` is committed alongside the source, so if you just
> want to **play**, skip straight to the next section.

---

## Playing / testing it on **Windows**

### Option A — a desktop emulator (recommended for playing)

1. Download an NES emulator. Good choices:
   * **Mesen** — <https://www.mesen.ca/> (very accurate, great debugger)
   * **FCEUX** — <https://fceux.com/>
   * **Nestopia UE** — <https://0ldsk00l.ca/nestopia/>
2. Launch the emulator and open `border.nes`
   (drag-and-drop, or *File → Open*).
3. Default keyboard mapping is usually **Arrow keys = D-Pad** and
   **Enter = START** (check *Config → Input* to confirm / rebind).
4. Press **START/Enter** on the title screen and go smuggle.

### Option B — run it in your browser (zero install)

Open <https://jsnes.org/> or <https://www.emulatorjs.com/> and drop
`border.nes` onto the page. Handy for a quick sanity check.

### Option C — automated / headless testing (what CI could do)

The ROM was regression-tested with the pure-Python emulator **pyntendo**,
which boots a ROM and returns each frame as a pixel array — no display needed.
This works identically on Windows:

```powershell
pip install pyntendo cython numpy pillow
```

```python
# smoketest.py  -- boot the ROM, press START, save a PNG of the playfield
from nes.cycore.system import NES
import numpy as np
from PIL import Image

nes = NES("border.nes")
NONE  = [False]*8
START = [False, False, False, True, False, False, False, False]  # A,B,sel,START,U,D,L,R

nes.run_frame_headless(run_frames=8,  controller1_state=NONE)     # title
nes.run_frame_headless(run_frames=3,  controller1_state=START)    # press start
frame = nes.run_frame_headless(run_frames=8, controller1_state=NONE)
Image.fromarray(np.asarray(frame).astype("uint8")).save("playfield.png")
print("booted OK; wrote playfield.png")
```

```powershell
python smoketest.py
```

If `playfield.png` shows the border checker up top, lanes of traffic, and your
smuggler at the bottom, everything is working.

---

## Project layout

```
nes/
├── build.sh            # regenerate assets + assemble + link
├── nrom.cfg            # ld65 linker config (NROM-128 memory map)
├── border.nes          # <- the built, playable ROM
├── src/
│   ├── border.s        # the whole game in 6502 assembly
│   ├── chr.bin         # generated 8 KB graphics (do not hand-edit)
│   └── music.inc       # generated APU period tables + song data
└── tools/
    ├── chrgen.py       # draws the font + sprites, packs NES CHR
    └── gen_music.py    # builds the note tables + the (original) jazz loop
```

## Sound

On top of the music there's a full set of **sound effects** — console drops
and errors in the packing stage, hops and border-crossing chimes in the run,
shield warbles, the Warthog's gun, chopper hits and a big explosion when the
boss goes down. They play on a lightweight two-slot mixer (a tonal slot on
pulse 2, a burst slot on the noise channel) that briefly borrows those
channels from the music and hands them straight back, so the melody and bass
never stop.

## A note on the music

Every stage has its **own original track**, switched in as you enter it:

| Stage | Mood |
| ----- | ---- |
| Title / attract | cosy lounge jazz (ii–V–I–vi in C) |
| The Packing | tense minor-key timer groove |
| The Crossing | bright, bouncy, hopping |
| The Getaway | fast driving chase |
| The Chopper (boss) | intense and urgent |
| Victory | triumphant fanfare |
| Game Over | a short somber descent |

All are **original compositions** written for this game — invented melodies
over common, non-copyrightable chord progressions. None is a transcription of
any existing theme. They play on a four-channel engine (two pulses, triangle
bass, noise drums); the SFX mixer briefly borrows pulse 2 and the noise
channel and hands them back so the tune never stops.
