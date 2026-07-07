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

## Stage 1 — THE PACKING (a falling-block puzzle)

Before the border run you have to physically **cram the Sega gear into a
storage bin the size of a colon** — a falling-block (Tetris-style) puzzle.
Sega-component pieces drop from the top; slide and rotate them to pack them in
tight. A completely filled row **seals and clears**, making room for more.

Every crate you pack becomes loot on the victory screen — but the fuller your
haul, the **slower you waddle** on the run. So the hard decision is: keep
stuffing for a bigger payout, or seal the bag early to stay nimble in traffic.

* **D-Pad Left/Right** — slide the piece
* **D-Pad Down** — soft drop (fall faster)
* **A** — rotate
* **Up** — hard drop (slam it down and lock)
* **START** — seal the bag and begin the run

The stage ends when you press START or the bin tops out. Your total crates
packed are reported on the victory screen.

## Controls (the run)

| Button | Action |
| ------ | ------ |
| **D-Pad** | Waddle one lane up / down / left / right |
| **START** | Begin game / continue from a screen |

Reach the checkered border at the top to cross into Canada and advance a level.
Clear all three crossings and you hit the final stage.

## Stage 3 — THE GETAWAY (side-scroller)

Border control is on you. Floor the **Warthog** north in a side-scrolling
chase: the desert streams by, hazards — patrol cars, border rigs, moose and
boulders — charge in from the right, and you **steer up and down** to weave
through them. Your Halo shield still soaks one hit before you start losing
lives. Survive to fill the **DIST** meter and you're home free.

* **D-Pad Up/Down** — steer the Warthog across the road
* Survive until the distance bar fills to win

The chase gets faster and the hazards thicker the further you get.
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

## A note on the music

The soundtrack is an **original composition** — a lounge-jazz loop
(ii–V–I–vi in C: Dm7 → G7 → Cmaj7 → Am7) with a walking triangle bass, comped
pulse harmony and brushed noise drums, written to evoke a cosy-sitcom-jazz
mood. It is not a transcription of any existing theme.
