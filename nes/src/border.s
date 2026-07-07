; ===========================================================================
;  BORDER RUN  --  an NROM (mapper 0) NES game.
;
;  You are smuggling a full Sega Genesis -- with Sega CD *and* 32X -- across
;  the US/Canada border the only way that fools the scanners: lodged firmly
;  up your own colon.  Waddle north through Halo-2-flavoured traffic,
;  Frogger-style, to reach the Canadian checkpoint.  Cars, border-patrol
;  rigs, Warthogs and moose end your run -- but a Halo-style rechargeable
;  energy shield buys you a second chance.  Soundtrack: an original cosy
;  lounge-jazz loop.
;
;  Controls:  D-Pad = move one lane.  START = begin / continue.
;
;  Build:  ca65 + ld65  ->  border.nes  (see build.sh / README.md)
; ===========================================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $01              ; 1 x 16 KB PRG
    .byte $01              ; 1 x 8  KB CHR
    .byte $00              ; flags6: mapper 0, horizontal mirroring
    .byte $00              ; flags7
    .byte $00, $00, $00, $00, $00, $00, $00, $00

; ---- register / constant equates -----------------------------------------
PPUCTRL   = $2000
PPUMASK   = $2001
PPUSTATUS = $2002
OAMADDR   = $2003
PPUSCROLL = $2005
PPUADDR   = $2006
PPUDATA   = $2007
OAMDMA    = $4014
APUSTATUS = $4015
JOYPAD1   = $4016

BTN_A     = $80
BTN_B     = $40
BTN_SEL   = $20
BTN_START = $10
BTN_UP    = $08
BTN_DOWN  = $04
BTN_LEFT  = $02
BTN_RIGHT = $01

ST_TITLE  = 0
ST_PLAY   = 1
ST_DEAD   = 2
ST_LEVEL  = 3
ST_OVER   = 4
ST_WIN    = 5
ST_PACK   = 6
ST_GETAWAY = 7

NUM_LANES  = 8
CARS_PER   = 3
NUM_CARS   = NUM_LANES * CARS_PER      ; 24

SH_MAX     = 3
IFRAMES    = 60
REGEN_DLY  = 150
DEAD_TIME  = 90
LEVEL_TIME = 110
MAX_LEVEL  = 3

; packing stage (falling-block) geometry
PW         = 8          ; play field width  (cells)
PH         = 12         ; play field height (cells)
PWH        = PW * PH
BIN_COL    = 12         ; nametable column of the bin interior
BIN_ROW    = 7          ; nametable row of the bin interior
GRAV       = 30         ; frames per gravity step

; getaway (side-scroller) stage
N_OBST     = 6          ; simultaneous hazards
WART_X     = 40         ; warthog fixed screen x
GY_MIN     = 140        ; warthog vertical range on the road
GY_MAX     = 188
GT_TARGET  = 16        ; distance before the boss chopper arrives
N_CLOUD    = 3          ; background parallax clouds
N_STREAK   = 4          ; foreground parallax speed streaks
N_BOMB     = 3          ; chopper bombs in flight
N_BULL     = 2          ; player bullets in flight
BOSS_HP    = 8          ; hits to down the chopper (also HP-bar cells)
FIRE_CD    = 10         ; frames between player shots
BOSS_X0    = 200        ; chopper hover x

PLAYER_X0  = 120
PLAYER_Y0  = 208
GOAL_Y     = 16
TEMPO      = 14
HITBOX     = 12
NT         = $2000

; Draw a nul-terminated string at a nametable address (rendering must be off).
.macro PUTS straddr, ntaddr
    lda #<(straddr)
    sta ptr
    lda #>(straddr)
    sta ptr+1
    lda #>(ntaddr)
    sta PPUADDR
    lda #<(ntaddr)
    sta PPUADDR
    jsr puts
.endmacro

; ---- zero page ------------------------------------------------------------
.segment "ZEROPAGE"
ptr:        .res 2
nmi_done:   .res 1
frame:      .res 1
rng:        .res 2
pad1:       .res 1
pad1_prev:  .res 1
pad1_new:   .res 1
state:      .res 1
statetmr:   .res 1
px:         .res 1
py:         .res 1
pframe:     .res 1
lives:      .res 1
shield:     .res 1
iframes:    .res 1
regentmr:   .res 1
level:      .res 1
oam_idx:    .res 1
vbuf_len:   .res 1
hud_dirty:  .res 1
tmp:        .res 1
tmp2:       .res 1
tmp3:       .res 1
tmp4:       .res 1
carlane:    .res 1
carloop:    .res 1
ppuctrl_val: .res 1    ; current PPUCTRL (8x16 for run, 8x8 for packing)
weight:     .res 1     ; load carried into the run
loot_val:   .res 1     ; unused holdover (kept for alignment)
move_timer: .res 1     ; frames until next move allowed (waddle)
move_delay: .res 1     ; waddle cooldown derived from weight
; --- packing stage (falling-block) state ---
cur_piece:  .res 1
cur_rot:    .res 1
cur_x:      .res 1     ; grid col of piece 4x4 box (0..PW-1, wraps for <0)
cur_y:      .res 1     ; grid row of piece 4x4 box
next_piece: .res 1
grav_timer: .res 1
packed:     .res 1     ; cumulative crates packed (payout + weight)
pack_over:  .res 1
pmask_lo:   .res 1     ; working copy of current rotation mask
pmask_hi:   .res 1
cellc:      .res 1     ; scratch: cell column
cellr:      .res 1     ; scratch: cell row
bitn:       .res 1     ; scratch: bit index 0..15
wr:         .res 1     ; scratch: line-clear write row
; --- getaway stage state ---
gy:         .res 1     ; warthog y
dist_lo:    .res 1
dist_hi:    .res 1
scroll_spd: .res 1
spawn_tmr:  .res 1
spawn_per:  .res 1
obloop:     .res 1
; --- getaway boss + parallax ---
boss_on:    .res 1     ; 0 = dodging traffic, 1 = chopper fight
boss_hp:    .res 1
boss_x:     .res 1
boss_y:     .res 1
boss_dir:   .res 1     ; vertical sweep direction
boss_atk:   .res 1     ; bomb-drop timer
boss_ent:   .res 1     ; entrance countdown
fire_cd:    .res 1     ; player shot cooldown
mus_step:   .res 1
mus_tick:   .res 1
mus_on:     .res 1
noise_vol:  .res 1

.segment "OAMBUF"
oam:        .res 256

.segment "BSS"
carXhi:     .res NUM_CARS
carXlo:     .res NUM_CARS
lane_spd_lo: .res NUM_LANES
lane_spd_hi: .res NUM_LANES
vbuf:       .res 200
hudline:    .res 32
field:      .res PWH        ; packing bin: 0 empty, 1 crate
rowbuf:     .res PW         ; scratch row for bin redraws
cratebuf:   .res 3          ; 3-digit crate count
ob_active:  .res N_OBST     ; getaway hazards
ob_x:       .res N_OBST
ob_y:       .res N_OBST
ob_type:    .res N_OBST
cloud_x:    .res N_CLOUD    ; background parallax
cloud_y:    .res N_CLOUD
streak_x:   .res N_STREAK   ; foreground parallax
streak_y:   .res N_STREAK
bomb_a:     .res N_BOMB     ; chopper bombs
bomb_x:     .res N_BOMB
bomb_y:     .res N_BOMB
bull_a:     .res N_BULL     ; player bullets
bull_x:     .res N_BULL
bull_y:     .res N_BULL

; ===========================================================================
.segment "CODE"

; --------------------------------------------------------------------------
.proc reset
    sei
    cld
    ldx #$40
    stx $4017
    ldx #$ff
    txs
    inx
    stx PPUCTRL
    stx PPUMASK
    stx $4010

    bit PPUSTATUS
:   bit PPUSTATUS
    bpl :-

    lda #0
    ldx #0
:   sta $0000, x
    sta $0100, x
    sta $0300, x
    sta $0400, x
    sta $0500, x
    sta $0600, x
    sta $0700, x
    inx
    bne :-

    lda #$ff
    ldx #0
:   sta oam, x
    inx
    bne :-

:   bit PPUSTATUS
    bpl :-

    lda #$0f
    sta APUSTATUS
    lda #$00
    sta $4001
    sta $4005

    jsr load_pal_game

    lda #$a5
    sta rng
    lda #$c3
    sta rng+1

    lda #%10100000         ; NMI on, 8x16 sprites (default for run/title)
    sta ppuctrl_val

    lda #ST_TITLE
    sta state
    lda #1
    sta mus_on
    jsr enter_title

    lda ppuctrl_val
    sta PPUCTRL
    lda #%00011110
    sta PPUMASK

mainloop:
    lda nmi_done
    beq mainloop
    lda #0
    sta nmi_done

    jsr read_pad
    jsr update_rng
    jsr run_state
    jsr music_tick
    jmp mainloop
.endproc

; --------------------------------------------------------------------------
.proc nmi
    pha
    txa
    pha
    tya
    pha

    lda #$00
    sta OAMADDR
    lda #$02
    sta OAMDMA

    jsr flush_vbuf

    lda ppuctrl_val
    sta PPUCTRL
    lda #%00011110
    sta PPUMASK
    lda #0
    sta PPUSCROLL
    sta PPUSCROLL

    inc frame
    lda #1
    sta nmi_done

    pla
    tay
    pla
    tax
    pla
    rti
.endproc

.proc irq
    rti
.endproc

; --------------------------------------------------------------------------
;  Flush queued VRAM writes (called in vblank).  Records:
;  [addrHi, addrLo, count, count bytes...], list ends when addrHi == 0.
; --------------------------------------------------------------------------
.proc flush_vbuf
    ldx #0
loop:
    lda vbuf, x
    beq done
    sta PPUADDR
    inx
    lda vbuf, x
    sta PPUADDR
    inx
    lda vbuf, x
    tay
    inx
copy:
    lda vbuf, x
    sta PPUDATA
    inx
    dey
    bne copy
    jmp loop
done:
    lda #0
    sta vbuf
    sta vbuf_len
    rts
.endproc

; --------------------------------------------------------------------------
;  Append a run to the VRAM buffer.
;   ptr  -> source, tmp2 = count, tmp3 = PPU addr hi, tmp4 = PPU addr lo
; --------------------------------------------------------------------------
.proc vbuf_add
    ldx vbuf_len
    lda tmp3
    sta vbuf, x
    inx
    lda tmp4
    sta vbuf, x
    inx
    lda tmp2
    sta vbuf, x
    inx
    ldy #0
cp:
    lda (ptr), y
    sta vbuf, x
    inx
    iny
    cpy tmp2
    bne cp
    lda #0
    sta vbuf, x
    stx vbuf_len
    rts
.endproc

; --------------------------------------------------------------------------
.proc read_pad
    lda pad1
    sta pad1_prev
    lda #1
    sta JOYPAD1
    lda #0
    sta JOYPAD1
    ldx #8
    lda #0
    sta pad1
:   lda JOYPAD1
    lsr a
    rol pad1
    dex
    bne :-
    lda pad1_prev
    eor #$ff
    and pad1
    sta pad1_new
    rts
.endproc

.proc update_rng
    lda rng
    lsr a
    rol rng+1
    bcc :+
    eor #$b4
:   sta rng
    lda frame
    eor rng+1
    sta rng+1
    rts
.endproc

; --------------------------------------------------------------------------
.proc run_state
    lda state
    asl a
    tax
    lda state_tab, x
    sta ptr
    lda state_tab+1, x
    sta ptr+1
    jmp (ptr)
state_tab:
    .word do_title
    .word do_play
    .word do_dead
    .word do_level
    .word do_over
    .word do_win
    .word do_pack
    .word do_getaway
.endproc

; ===========================================================================
;  TITLE
; ===========================================================================
.proc enter_title
    jsr ppu_off
    jsr clear_nametable
    lda #<txt_title
    sta ptr
    lda #>txt_title
    sta ptr+1
    jsr draw_script
    jsr hide_all_oam
    lda #1
    sta mus_on
    jsr ppu_on
    rts
.endproc

.proc do_title
    lda #0
    sta oam_idx
    lda #116
    sta tmp
    lda #112
    sta tmp2
    lda #$24
    sta tmp3
    lda #3
    sta tmp4
    jsr draw_meta16
    jsr hide_rest_oam

    lda pad1_new
    and #BTN_START
    beq :+
    jsr new_game
:   rts
.endproc

; ===========================================================================
.proc new_game
    lda #3
    sta lives
    lda #1
    sta level
    lda #0
    sta weight
    sta packed
    sta pack_over
    lda #ST_PACK
    sta state
    jsr enter_pack
    rts
.endproc

; --------------------------------------------------------------------------
.proc setup_level
    jsr ppu_off
    lda #%10100000         ; back to 8x16 sprite mode for the run
    sta ppuctrl_val
    jsr load_pal_game
    jsr clear_nametable
    jsr draw_field
    jsr copy_speeds
    jsr spawn_cars
    lda #PLAYER_X0
    sta px
    lda #PLAYER_Y0
    sta py
    lda #SH_MAX
    sta shield
    lda #0
    sta iframes
    sta regentmr
    sta pframe
    sta move_timer
    lda #1
    sta hud_dirty
    sta mus_on
    jsr ppu_on
    rts
.endproc

; --------------------------------------------------------------------------
;  Copy this level's 8 lane speeds from ROM into RAM.
; --------------------------------------------------------------------------
.proc copy_speeds
    lda level
    sec
    sbc #1
    asl a
    asl a
    asl a               ; (level-1) * 8
    tax
    ldy #0
loop:
    lda spd_lo_lvl, x
    sta lane_spd_lo, y
    lda spd_hi_lvl, x
    sta lane_spd_hi, y
    inx
    iny
    cpy #NUM_LANES
    bne loop
    rts
.endproc

; --------------------------------------------------------------------------
;  Lay out cars from the ROM starting-position table.
; --------------------------------------------------------------------------
.proc spawn_cars
    ldx #0
loop:
    lda car_init, x
    sta carXhi, x
    lda #0
    sta carXlo, x
    inx
    cpx #NUM_CARS
    bne loop
    rts
.endproc

; ===========================================================================
;  PLAY
; ===========================================================================
.proc do_play
    jsr play_input
    jsr move_cars
    jsr check_collision
    lda state
    cmp #ST_PLAY
    bne @leave
    jsr shield_regen
    jsr build_hud
    jsr render_play
@leave:
    rts
.endproc

; --------------------------------------------------------------------------
.proc play_input
    ; waddle: heavy loadouts can only move every move_delay frames
    lda move_timer
    beq @ready
    dec move_timer
    rts
@ready:
    lda pad1_new
    and #BTN_UP
    beq @nu
    lda py
    sec
    sbc #16
    sta py
    jsr did_move
@nu:
    lda pad1_new
    and #BTN_DOWN
    beq @nd
    lda py
    cmp #PLAYER_Y0
    bcs @nd
    clc
    adc #16
    sta py
    jsr did_move
@nd:
    lda pad1_new
    and #BTN_LEFT
    beq @nl
    lda px
    cmp #8
    bcc @nl
    sec
    sbc #16
    sta px
    jsr did_move
@nl:
    lda pad1_new
    and #BTN_RIGHT
    beq @nr
    lda px
    cmp #232
    bcs @nr
    clc
    adc #16
    sta px
    jsr did_move
@nr:
    rts
.endproc

; --------------------------------------------------------------------------
;  Register a completed move: advance the walk frame and start the waddle
;  cooldown so the next move is delayed by move_delay frames.
; --------------------------------------------------------------------------
.proc did_move
    inc pframe
    lda move_delay
    sta move_timer
    rts
.endproc

; --------------------------------------------------------------------------
.proc move_cars
    ldx #0
loop:
    ldy slot_lane, x
    lda lane_spd_lo, y
    clc
    adc carXlo, x
    sta carXlo, x
    lda lane_spd_hi, y
    adc carXhi, x
    sta carXhi, x
    inx
    cpx #NUM_CARS
    bne loop
    rts
.endproc

; --------------------------------------------------------------------------
;  Collision + goal test.  May change game state.
; --------------------------------------------------------------------------
.proc check_collision
    lda iframes
    beq @active
    rts
@active:
    lda py
    lsr a
    lsr a
    lsr a
    lsr a
    tay
    lda bandLane, y
    cmp #$ff
    bne @notsafe
    rts
@notsafe:
    cmp #$fe
    bne @lane
    jmp player_win
@lane:
    sta carlane
    asl a
    clc
    adc carlane          ; lane * 3
    tax
    ldy #CARS_PER
@cl:
    lda carXhi, x
    sec
    sbc px
    bpl @pos
    eor #$ff
    clc
    adc #1
@pos:
    cmp #HITBOX
    bcc @hit
    inx
    dey
    bne @cl
    rts
@hit:
    jmp player_hit
.endproc

; --------------------------------------------------------------------------
.proc player_hit
    lda #0
    sta regentmr
    lda shield
    beq @lose
    dec shield
    lda #IFRAMES
    sta iframes
    lda #PLAYER_Y0
    sta py
    lda #1
    sta hud_dirty
    rts
@lose:
    dec lives
    lda #DEAD_TIME
    sta iframes          ; keep player flashing through the DEAD pause
    lda #1
    sta hud_dirty
    lda #ST_DEAD
    sta state
    lda #DEAD_TIME
    sta statetmr
    rts
.endproc

; --------------------------------------------------------------------------
.proc player_win
    lda level
    cmp #MAX_LEVEL
    bcs @winall
    inc level
    lda #ST_LEVEL
    sta state
    lda #LEVEL_TIME
    sta statetmr
    jsr enter_level
    rts
@winall:
    ; crossed the border -- now floor it away from border control
    lda #ST_GETAWAY
    sta state
    jsr enter_getaway
    rts
.endproc

; --------------------------------------------------------------------------
.proc shield_regen
    lda iframes
    bne @dec
    lda shield
    cmp #SH_MAX
    bcs @dec
    inc regentmr
    lda regentmr
    cmp #REGEN_DLY
    bcc @dec
    lda #SH_MAX
    sta shield
    lda #0
    sta regentmr
    lda #1
    sta hud_dirty
@dec:
    lda iframes
    beq @done
    dec iframes
@done:
    rts
.endproc

; ===========================================================================
;  DEAD (pause after losing a life)
; ===========================================================================
.proc do_dead
    jsr build_hud
    jsr render_play
    dec statetmr
    bne @ret
    lda lives
    beq @over
    lda #SH_MAX
    sta shield
    lda #PLAYER_X0
    sta px
    lda #PLAYER_Y0
    sta py
    lda #0
    sta iframes
    sta regentmr
    lda #1
    sta hud_dirty
    lda #ST_PLAY
    sta state
@ret:
    rts
@over:
    jsr enter_over
    lda #ST_OVER
    sta state
    rts
.endproc

; ===========================================================================
;  LEVEL interstitial
; ===========================================================================
.proc do_level
    dec statetmr
    bne @ret
    jsr setup_level
    lda #ST_PLAY
    sta state
@ret:
    rts
.endproc

.proc enter_level
    jsr ppu_off
    jsr clear_nametable
    lda #<txt_level
    sta ptr
    lda #>txt_level
    sta ptr+1
    jsr draw_script
    lda #>(NT + 10*32 + 19)
    sta PPUADDR
    lda #<(NT + 10*32 + 19)
    sta PPUADDR
    lda level
    clc
    adc #'0'
    sta PPUDATA
    jsr hide_all_oam
    jsr ppu_on
    rts
.endproc

; ===========================================================================
;  GAME OVER / WIN
; ===========================================================================
.proc do_over
    lda pad1_new
    and #BTN_START
    beq @ret
    jsr enter_title
    lda #ST_TITLE
    sta state
@ret:
    rts
.endproc

.proc do_win
    lda pad1_new
    and #BTN_START
    beq @ret
    jsr enter_title
    lda #ST_TITLE
    sta state
@ret:
    rts
.endproc

.proc enter_over
    jsr ppu_off
    lda #%10100000
    sta ppuctrl_val
    jsr load_pal_game
    jsr clear_nametable
    lda #<txt_over
    sta ptr
    lda #>txt_over
    sta ptr+1
    jsr draw_script
    jsr hide_all_oam
    jsr ppu_on
    rts
.endproc

.proc enter_win
    jsr ppu_off
    lda #%10100000
    sta ppuctrl_val
    jsr load_pal_game
    jsr clear_nametable
    lda #<txt_win
    sta ptr
    lda #>txt_win
    sta ptr+1
    jsr draw_script
    ; crates delivered at row 16, col 19 (3 digits)
    lda #>(NT + 16*32 + 19)
    sta PPUADDR
    lda #<(NT + 16*32 + 19)
    sta PPUADDR
    jsr packed_digits
    lda cratebuf+0
    sta PPUDATA
    lda cratebuf+1
    sta PPUDATA
    lda cratebuf+2
    sta PPUDATA
    jsr hide_all_oam
    jsr ppu_on
    rts
.endproc

; ===========================================================================
;  PACKING STAGE  --  a falling-block puzzle: Tetris the Sega gear into the
;  storage bin.  Pieces fall, you slide/rotate/hard-drop them, full rows seal
;  and clear.  Every crate you pack becomes loot -- but a fuller haul makes
;  you waddle slower on the border run.  START seals the bag and runs.
; ===========================================================================
.proc enter_pack
    jsr ppu_off
    lda #%10001000          ; NMI on, 8x8 sprites, sprite pattern table 1
    sta ppuctrl_val
    jsr load_pal_pack
    jsr clear_nametable
    jsr draw_bin_frame
    jsr draw_pack_labels
    ; clear the field
    ldx #0
    lda #0
:   sta field, x
    inx
    cpx #PWH
    bne :-
    lda #0
    sta pack_over
    sta packed
    jsr rand7
    sta next_piece
    jsr spawn_piece
    lda #GRAV
    sta grav_timer
    jsr draw_crates
    jsr hide_all_oam
    lda #1
    sta mus_on
    jsr ppu_on
    rts
.endproc

; --------------------------------------------------------------------------
.proc do_pack
    lda pack_over
    beq @play
    jsr commit_loadout
    rts
@play:
    lda pad1_new
    and #BTN_START
    beq @nstart
    jsr commit_loadout
    rts
@nstart:
    lda pad1_new
    and #BTN_LEFT
    beq @nl
    dec cur_x
    jsr can_place
    beq @nl
    inc cur_x
@nl:
    lda pad1_new
    and #BTN_RIGHT
    beq @nr
    inc cur_x
    jsr can_place
    beq @nr
    dec cur_x
@nr:
    lda pad1_new
    and #BTN_A
    beq @na
    jsr try_rotate
@na:
    lda pad1_new
    and #BTN_UP
    beq @nu
    jsr hard_drop
    jmp @render
@nu:
    ; gravity: soft-drop faster while Down is held
    lda pad1
    and #BTN_DOWN
    beq @g1
    lda #4
    jmp @g2
@g1:
    lda #GRAV
@g2:
    sta tmp                 ; step period
    dec grav_timer
    bpl @render
    lda tmp
    sta grav_timer
    inc cur_y
    jsr can_place
    beq @render
    dec cur_y
    jsr lock_piece
@render:
    lda pack_over
    bne @done
    jsr draw_active_and_next
@done:
    rts
.endproc

; --------------------------------------------------------------------------
;  load piece_lo/hi[cur_piece*4 + cur_rot] into pmask_lo/hi
; --------------------------------------------------------------------------
.proc get_mask
    lda cur_piece
    asl a
    asl a
    clc
    adc cur_rot
    tax
    lda piece_lo, x
    sta pmask_lo
    lda piece_hi, x
    sta pmask_hi
    rts
.endproc

; test bit `bitn` (0..15) of pmask; returns A=0 (clear) or nonzero (set)
.proc mask_bit_set
    lda bitn
    cmp #8
    bcc @lo
    sec
    sbc #8
    tax
    lda pmask_hi
    jmp @sh
@lo:
    tax
    lda pmask_lo
@sh:
    cpx #0
    beq @test
:   lsr a
    dex
    bne :-
@test:
    and #1
    rts
.endproc

; Y = cellr*PW + cellc
.proc field_index
    lda cellr
    asl a
    asl a
    asl a
    clc
    adc cellc
    tay
    rts
.endproc

; --------------------------------------------------------------------------
;  Can the current piece (cur_piece/rot/x/y) occupy the field?
;  Returns A=0 if yes, A=1 (nonzero) if blocked.
; --------------------------------------------------------------------------
.proc can_place
    jsr get_mask
    lda #0
    sta bitn
@loop:
    jsr mask_bit_set
    beq @next
    lda bitn
    lsr a
    lsr a
    clc
    adc cur_y
    sta cellr
    lda bitn
    and #3
    clc
    adc cur_x
    sta cellc
    lda cellc
    cmp #PW
    bcs @blocked            ; column out of range (also catches wrap)
    lda cellr
    cmp #PH
    bcs @blocked            ; row past the bottom
    jsr field_index
    lda field, y
    bne @blocked
@next:
    inc bitn
    lda bitn
    cmp #16
    bne @loop
    lda #0
    rts
@blocked:
    lda #1
    rts
.endproc

; --------------------------------------------------------------------------
.proc try_rotate
    lda cur_rot
    sta tmp                 ; save old rotation
    clc
    adc #1
    and #3
    sta cur_rot
    jsr can_place
    beq @ok
    dec cur_x               ; kick left
    jsr can_place
    beq @ok
    inc cur_x
    inc cur_x               ; kick right
    jsr can_place
    beq @ok
    dec cur_x
    lda tmp                 ; revert
    sta cur_rot
@ok:
    rts
.endproc

; --------------------------------------------------------------------------
.proc hard_drop
:   inc cur_y
    jsr can_place
    beq :-
    dec cur_y
    jsr lock_piece
    rts
.endproc

; --------------------------------------------------------------------------
;  Lock the current piece into the field, tally crates, clear full rows,
;  repaint the bin, then spawn the next piece.
; --------------------------------------------------------------------------
.proc lock_piece
    jsr get_mask
    lda #0
    sta bitn
@loop:
    jsr mask_bit_set
    beq @next
    lda bitn
    lsr a
    lsr a
    clc
    adc cur_y
    sta cellr
    lda bitn
    and #3
    clc
    adc cur_x
    sta cellc
    jsr field_index
    lda #1
    sta field, y
    lda packed
    cmp #240
    bcs @next
    inc packed
@next:
    inc bitn
    lda bitn
    cmp #16
    bne @loop
    jsr line_clear
    jsr redraw_bin
    jsr queue_crates
    jsr spawn_piece
    rts
.endproc

; --------------------------------------------------------------------------
.proc spawn_piece
    lda next_piece
    sta cur_piece
    jsr rand7
    sta next_piece
    lda #0
    sta cur_rot
    sta cur_y
    lda #2
    sta cur_x
    jsr can_place
    beq @ok
    lda #1
    sta pack_over
@ok:
    rts
.endproc

; --------------------------------------------------------------------------
;  Remove full rows by compacting the field downward.
; --------------------------------------------------------------------------
.proc line_clear
    lda #(PH-1)
    sta wr
    lda #(PH-1)
    sta cellr               ; rr = source row
@rowloop:
    jsr row_full
    bne @next               ; full -> drop it (skip, don't advance wr)
    lda cellr
    cmp wr
    beq @afterwr
    jsr copy_row            ; move kept row down to wr
@afterwr:
    dec wr
@next:
    dec cellr
    bpl @rowloop
    ; clear rows 0..wr
    lda wr
    bmi @done
    clc
    adc #1
    asl a
    asl a
    asl a                   ; (wr+1)*PW
    tax
    lda #0
@clr:
    dex
    sta field, x
    cpx #0
    bne @clr
@done:
    rts
.endproc

; is row `cellr` completely filled?  A=1 full, A=0 not
.proc row_full
    lda cellr
    asl a
    asl a
    asl a
    tay                     ; base index
    ldx #PW
@l:
    lda field, y
    beq @no
    iny
    dex
    bne @l
    lda #1
    rts
@no:
    lda #0
    rts
.endproc

; copy field row cellr -> row wr (PW bytes)
.proc copy_row
    lda cellr
    asl a
    asl a
    asl a
    sta tmp                 ; src base
    lda wr
    asl a
    asl a
    asl a
    sta tmp2                ; dst base
    ldx #0
@l:
    txa
    clc
    adc tmp
    tay
    lda field, y
    pha
    txa
    clc
    adc tmp2
    tay
    pla
    sta field, y
    inx
    cpx #PW
    bne @l
    rts
.endproc

; --------------------------------------------------------------------------
;  Repaint the whole bin interior to the nametable (queued for vblank).
; --------------------------------------------------------------------------
.proc redraw_bin
    lda #0
    sta cellr               ; row r
@rowl:
    lda cellr
    asl a
    asl a
    asl a
    sta tmp                 ; base = r*PW
    ldy #0
@celll:
    tya
    clc
    adc tmp
    tax
    lda field, x
    beq @empty
    lda #$08                ; crate
    jmp @put
@empty:
    lda #$09
@put:
    sta rowbuf, y
    iny
    cpy #PW
    bne @celll
    ; nametable address of (BIN_ROW + r, BIN_COL)
    lda cellr
    clc
    adc #BIN_ROW
    sta tmp                 ; row tile index
    and #7
    asl a
    asl a
    asl a
    asl a
    asl a
    clc
    adc #BIN_COL
    sta tmp4                ; low byte
    lda tmp
    lsr a
    lsr a
    lsr a
    clc
    adc #$20
    sta tmp3                ; high byte
    lda #<rowbuf
    sta ptr
    lda #>rowbuf
    sta ptr+1
    lda #PW
    sta tmp2
    jsr vbuf_add
    inc cellr
    lda cellr
    cmp #PH
    bne @rowl
    rts
.endproc

; --------------------------------------------------------------------------
;  Draw the walls + empty interior (rendering off).
; --------------------------------------------------------------------------
.proc draw_bin_frame
    bit PPUSTATUS
    lda #>(NT + (BIN_ROW-1)*32 + (BIN_COL-1))
    sta PPUADDR
    lda #<(NT + (BIN_ROW-1)*32 + (BIN_COL-1))
    sta PPUADDR
    ldx #(PW+2)
    lda #$0a
:   sta PPUDATA
    dex
    bne :-
    lda #0
    sta cellr
@rowl:
    lda cellr
    clc
    adc #BIN_ROW
    sta tmp
    lsr a
    lsr a
    lsr a
    clc
    adc #$20
    sta PPUADDR
    lda tmp
    and #7
    asl a
    asl a
    asl a
    asl a
    asl a
    clc
    adc #(BIN_COL-1)
    sta PPUADDR
    lda #$0a
    sta PPUDATA
    ldx #PW
    lda #$09
:   sta PPUDATA
    dex
    bne :-
    lda #$0a
    sta PPUDATA
    inc cellr
    lda cellr
    cmp #PH
    bne @rowl
    lda #>(NT + (BIN_ROW+PH)*32 + (BIN_COL-1))
    sta PPUADDR
    lda #<(NT + (BIN_ROW+PH)*32 + (BIN_COL-1))
    sta PPUADDR
    ldx #(PW+2)
    lda #$0a
:   sta PPUDATA
    dex
    bne :-
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_pack_labels
    PUTS str_packhdr, NT + 2*32 + 8
    PUTS str_packsub, NT + 4*32 + 6
    PUTS str_next,    NT + 8*32 + 23
    PUTS str_crates,  NT + 24*32 + 4
    PUTS str_ctrl1,   NT + 26*32 + 2
    PUTS str_ctrl2,   NT + 27*32 + 2
    rts
.endproc

; --------------------------------------------------------------------------
;  3-digit decimal of `packed` into cratebuf.
; --------------------------------------------------------------------------
.proc packed_digits
    lda packed
    ldx #'0'
@h:
    cmp #100
    bcc @hd
    sec
    sbc #100
    inx
    jmp @h
@hd:
    stx cratebuf+0
    ldx #'0'
@t:
    cmp #10
    bcc @td
    sec
    sbc #10
    inx
    jmp @t
@td:
    stx cratebuf+1
    clc
    adc #'0'
    sta cratebuf+2
    rts
.endproc

; draw crate count directly (rendering off)
.proc draw_crates
    jsr packed_digits
    lda #>(NT + 24*32 + 11)
    sta PPUADDR
    lda #<(NT + 24*32 + 11)
    sta PPUADDR
    lda cratebuf+0
    sta PPUDATA
    lda cratebuf+1
    sta PPUDATA
    lda cratebuf+2
    sta PPUDATA
    rts
.endproc

; queue crate count for vblank
.proc queue_crates
    jsr packed_digits
    lda #<cratebuf
    sta ptr
    lda #>cratebuf
    sta ptr+1
    lda #3
    sta tmp2
    lda #>(NT + 24*32 + 11)
    sta tmp3
    lda #<(NT + 24*32 + 11)
    sta tmp4
    jsr vbuf_add
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_active_and_next
    lda #0
    sta oam_idx
    jsr draw_active
    jsr draw_next
    jsr hide_rest_oam
    rts
.endproc

.proc draw_active
    jsr get_mask
    ldx cur_piece
    lda piece_pal, x
    sta tmp4
    lda #0
    sta bitn
@loop:
    jsr mask_bit_set
    beq @next
    lda bitn
    lsr a
    lsr a
    clc
    adc cur_y
    clc
    adc #BIN_ROW
    asl a
    asl a
    asl a
    sta tmp2                ; pixel y
    lda bitn
    and #3
    clc
    adc cur_x
    clc
    adc #BIN_COL
    asl a
    asl a
    asl a
    sta tmp                 ; pixel x
    jsr draw_block
@next:
    inc bitn
    lda bitn
    cmp #16
    bne @loop
    rts
.endproc

.proc draw_next
    lda next_piece
    asl a
    asl a
    tax
    lda piece_lo, x
    sta pmask_lo
    lda piece_hi, x
    sta pmask_hi
    ldx next_piece
    lda piece_pal, x
    sta tmp4
    lda #0
    sta bitn
@loop:
    jsr mask_bit_set
    beq @next
    lda bitn
    lsr a
    lsr a
    asl a
    asl a
    asl a
    clc
    adc #72                 ; preview y origin
    sta tmp2
    lda bitn
    and #3
    asl a
    asl a
    asl a
    clc
    adc #184                ; preview x origin
    sta tmp
    jsr draw_block
@next:
    inc bitn
    lda bitn
    cmp #16
    bne @loop
    rts
.endproc

; append one 8x8 block sprite:  tmp = x, tmp2 = y, tmp4 = palette
.proc draw_block
    ldx oam_idx
    lda tmp2
    sta oam, x
    inx
    lda #$38
    sta oam, x
    inx
    lda tmp4
    sta oam, x
    inx
    lda tmp
    sta oam, x
    inx
    stx oam_idx
    rts
.endproc

; --------------------------------------------------------------------------
;  Seal the bag: derive waddle weight from the haul, then start the run.
; --------------------------------------------------------------------------
.proc commit_loadout
    lda packed
    sta weight
    lsr a
    lsr a
    lsr a
    lsr a                   ; packed / 16
    asl a                   ; * 2
    sta move_delay
    jsr setup_level
    lda #ST_PLAY
    sta state
    rts
.endproc

; --------------------------------------------------------------------------
.proc rand7
    jsr update_rng
    lda rng
    and #7
    cmp #7
    bne @ok
    lda #6
@ok:
    rts
.endproc

; ===========================================================================
;  GETAWAY STAGE  --  a side-scroller.  After crossing the border you floor
;  the Warthog north; hazards charge in from the right, steer up/down to dodge
;  and survive the distance.  The Halo shield still soaks one hit.
; ===========================================================================
.proc enter_getaway
    jsr ppu_off
    lda #%10100000          ; 8x16 sprite mode
    sta ppuctrl_val
    jsr load_pal_getaway
    jsr clear_nametable
    jsr draw_getaway_scene
    lda #170
    sta gy
    lda #0
    sta dist_lo
    sta dist_hi
    sta iframes
    sta regentmr
    lda #SH_MAX
    sta shield
    lda #2
    sta scroll_spd
    lda #40
    sta spawn_per
    lda #24
    sta spawn_tmr
    ldx #0
    lda #0
:   sta ob_active, x
    inx
    cpx #N_OBST
    bne :-
    ; clear projectile pools + boss
    ldx #0
    lda #0
:   sta bomb_a, x
    inx
    cpx #N_BOMB
    bne :-
    ldx #0
    lda #0
:   sta bull_a, x
    inx
    cpx #N_BULL
    bne :-
    lda #0
    sta boss_on
    sta fire_cd
    ; scatter parallax clouds across the sky
    ldx #0
@cl:
    txa
    asl a
    asl a
    asl a
    asl a
    asl a                   ; i*32
    clc
    adc #40
    sta cloud_x, x
    txa
    asl a
    asl a
    asl a                   ; i*8
    clc
    adc #24
    sta cloud_y, x
    inx
    cpx #N_CLOUD
    bne @cl
    ; scatter foreground speed streaks along the road
    ldx #0
@sk:
    txa
    asl a
    asl a
    asl a
    asl a
    asl a
    asl a                   ; i*64
    sta streak_x, x
    txa
    and #1
    asl a
    asl a
    asl a
    asl a                   ; (i&1)*16
    clc
    adc #150
    sta streak_y, x
    inx
    cpx #N_STREAK
    bne @sk
    lda #1
    sta mus_on
    jsr ppu_on
    rts
.endproc

; --------------------------------------------------------------------------
.proc do_getaway
    jsr getaway_input
    jsr move_parallax
    lda boss_on
    bne @boss
    ; ---- phase 1: dodge traffic until the chopper catches up ----
    jsr move_obstacles
    jsr spawn_tick
    jsr getaway_collision
    lda state
    cmp #ST_GETAWAY
    beq @c1
    rts
@c1:
    jsr shield_regen
    lda dist_lo
    clc
    adc scroll_spd
    sta dist_lo
    bcc @nocarry
    inc dist_hi
@nocarry:
    jsr getaway_ramp
    lda dist_hi
    cmp #GT_TARGET
    bcc @render
    jsr init_boss           ; the chopper arrives
    jmp @render
@boss:
    ; ---- phase 2: the chopper fight ----
    jsr boss_logic
    lda state
    cmp #ST_GETAWAY
    beq @c2
    rts
@c2:
    jsr shield_regen
@render:
    jsr build_getaway_hud
    jsr draw_getaway
    rts
.endproc

; --------------------------------------------------------------------------
;  Parallax: clouds drift slowly (far), streaks race by (near).
; --------------------------------------------------------------------------
.proc move_parallax
    ; clouds move 1px every other frame
    lda frame
    and #1
    bne @streaks
    ldx #0
@cl:
    lda cloud_x, x
    sec
    sbc #1
    cmp #4
    bcs @clkeep
    lda #248
    sta cloud_x, x
    jsr rand_sky_y
    sta cloud_y, x
    jmp @clnext
@clkeep:
    sta cloud_x, x
@clnext:
    inx
    cpx #N_CLOUD
    bne @cl
@streaks:
    ldx #0
@sk:
    lda streak_x, x
    sec
    sbc #6                  ; fast foreground
    cmp #6
    bcs @skkeep
    lda #248
    sta streak_x, x
    jsr rand_road_y
    sta streak_y, x
    jmp @sknext
@skkeep:
    sta streak_x, x
@sknext:
    inx
    cpx #N_STREAK
    bne @sk
    rts
.endproc

.proc rand_sky_y
    jsr update_rng
    lda rng
    and #$3f
    clc
    adc #20
    rts
.endproc

.proc rand_road_y
    jsr update_rng
    lda rng+1
    and #$1f
    clc
    adc #150
    rts
.endproc

; --------------------------------------------------------------------------
.proc getaway_input
    lda pad1
    and #BTN_UP
    beq @nu
    lda gy
    cmp #GY_MIN+2
    bcc @nu
    dec gy
    dec gy
@nu:
    lda pad1
    and #BTN_DOWN
    beq @nd
    lda gy
    cmp #GY_MAX-1
    bcs @nd
    inc gy
    inc gy
@nd:
    rts
.endproc

; --------------------------------------------------------------------------
.proc move_obstacles
    ldx #0
@l:
    lda ob_active, x
    beq @next
    lda ob_x, x
    sec
    sbc scroll_spd
    bcc @kill
    cmp #4
    bcc @kill
    sta ob_x, x
    jmp @next
@kill:
    lda #0
    sta ob_active, x
@next:
    inx
    cpx #N_OBST
    bne @l
    rts
.endproc

; --------------------------------------------------------------------------
.proc spawn_tick
    dec spawn_tmr
    bne @ret
    lda spawn_per
    sta spawn_tmr
    jsr spawn_obstacle
@ret:
    rts
.endproc

.proc spawn_obstacle
    ldx #0
@find:
    lda ob_active, x
    beq @found
    inx
    cpx #N_OBST
    bne @find
    rts                     ; no free slot
@found:
    lda #1
    sta ob_active, x
    lda #248
    sta ob_x, x
    jsr update_rng
    lda rng
    and #3
    asl a
    asl a
    asl a
    asl a                   ; lane * 16
    clc
    adc #GY_MIN
    sta ob_y, x
    lda rng+1
    and #3
    sta ob_type, x
    rts
.endproc

; --------------------------------------------------------------------------
.proc getaway_collision
    lda iframes
    beq @go
    rts
@go:
    ldx #0
@l:
    lda ob_active, x
    beq @next
    lda ob_x, x
    sec
    sbc #WART_X
    bpl @dxp
    eor #$ff
    clc
    adc #1
@dxp:
    cmp #14
    bcs @next
    lda gy
    sec
    sbc ob_y, x
    bpl @dyp
    eor #$ff
    clc
    adc #1
@dyp:
    cmp #14
    bcs @next
    jsr getaway_crash
    rts
@next:
    inx
    cpx #N_OBST
    bne @l
    rts
.endproc

; --------------------------------------------------------------------------
.proc getaway_crash
    lda #0
    sta regentmr
    lda shield
    beq @lose
    dec shield
    lda #IFRAMES
    sta iframes
    rts
@lose:
    dec lives
    lda lives
    beq @over
    lda #SH_MAX
    sta shield
    lda #IFRAMES
    sta iframes
    rts
@over:
    jsr enter_over
    lda #ST_OVER
    sta state
    rts
.endproc

; --------------------------------------------------------------------------
;  Scale difficulty with distance travelled.
; --------------------------------------------------------------------------
.proc getaway_ramp
    lda dist_hi
    lsr a
    lsr a
    lsr a
    clc
    adc #2
    sta scroll_spd          ; 2..4
    lda dist_hi
    asl a
    sta tmp
    lda #40
    sec
    sbc tmp
    cmp #16
    bcs @store
    lda #16
@store:
    sta spawn_per           ; 16..40
    rts
.endproc

; --------------------------------------------------------------------------
;  Boss: the border-patrol chopper.  Shoot it down (A) while dodging bombs.
; --------------------------------------------------------------------------
.proc init_boss
    lda #1
    sta boss_on
    lda #BOSS_HP
    sta boss_hp
    lda #255
    sta boss_x
    lda #96
    sta boss_y
    lda #1
    sta boss_dir
    lda #45
    sta boss_atk
    lda #56
    sta boss_ent
    ldx #0
    lda #0
:   sta ob_active, x
    inx
    cpx #N_OBST
    bne :-
    rts
.endproc

.proc boss_logic
    lda boss_ent
    beq @fight
    ; entrance: slide in to the hover point
    dec boss_ent
    lda boss_x
    cmp #BOSS_X0
    bcc @flydone
    sec
    sbc #1
    sta boss_x
@flydone:
    jsr do_fire
    jsr move_bullets
    jsr bullet_boss_collision
    rts
@fight:
    ; vertical sweep between y=64 and y=148
    lda boss_dir
    beq @down
    dec boss_y
    lda boss_y
    cmp #64
    bne @mv
    lda #0
    sta boss_dir
    jmp @mv
@down:
    inc boss_y
    lda boss_y
    cmp #148
    bne @mv
    lda #1
    sta boss_dir
@mv:
    dec boss_atk
    bne @noatk
    lda #40
    sta boss_atk
    jsr drop_bomb
@noatk:
    jsr do_fire
    jsr move_bombs
    jsr move_bullets
    jsr bomb_player_collision
    lda state
    cmp #ST_GETAWAY
    beq @stillhere
    rts
@stillhere:
    jsr bullet_boss_collision
    lda boss_hp
    bne @alive
    ; chopper downed -> escape to Canada
    lda #ST_WIN
    sta state
    jsr enter_win
    rts
@alive:
    rts
.endproc

.proc do_fire
    lda fire_cd
    beq @canfire
    dec fire_cd
    rts
@canfire:
    lda pad1_new
    and #BTN_A
    beq @ret
    ldx #0
@f:
    lda bull_a, x
    beq @spawn
    inx
    cpx #N_BULL
    bne @f
    rts
@spawn:
    lda #1
    sta bull_a, x
    lda #WART_X+14
    sta bull_x, x
    lda gy
    clc
    adc #4
    sta bull_y, x
    lda #FIRE_CD
    sta fire_cd
@ret:
    rts
.endproc

.proc drop_bomb
    ldx #0
@f:
    lda bomb_a, x
    beq @spawn
    inx
    cpx #N_BOMB
    bne @f
    rts
@spawn:
    lda #1
    sta bomb_a, x
    lda boss_x
    sta bomb_x, x
    lda boss_y
    clc
    adc #10
    sta bomb_y, x
    rts
.endproc

.proc move_bullets
    ldx #0
@l:
    lda bull_a, x
    beq @next
    lda bull_x, x
    clc
    adc #6
    cmp #244
    bcs @kill
    sta bull_x, x
    jmp @next
@kill:
    lda #0
    sta bull_a, x
@next:
    inx
    cpx #N_BULL
    bne @l
    rts
.endproc

.proc move_bombs
    ldx #0
@l:
    lda bomb_a, x
    beq @next
    lda bomb_x, x
    sec
    sbc #3
    cmp #4
    bcc @kill
    sta bomb_x, x
    lda bomb_y, x
    clc
    adc #2
    cmp #202
    bcs @kill
    sta bomb_y, x
    jmp @next
@kill:
    lda #0
    sta bomb_a, x
@next:
    inx
    cpx #N_BOMB
    bne @l
    rts
.endproc

.proc bullet_boss_collision
    ldx #0
@l:
    lda bull_a, x
    beq @next
    lda bull_x, x
    sec
    sbc boss_x
    bpl @dxp
    eor #$ff
    clc
    adc #1
@dxp:
    cmp #24
    bcs @next
    lda bull_y, x
    sec
    sbc boss_y
    bpl @dyp
    eor #$ff
    clc
    adc #1
@dyp:
    cmp #12
    bcs @next
    lda #0
    sta bull_a, x
    lda boss_hp
    beq @next
    dec boss_hp
@next:
    inx
    cpx #N_BULL
    bne @l
    rts
.endproc

.proc bomb_player_collision
    lda iframes
    beq @go
    rts
@go:
    ldx #0
@l:
    lda bomb_a, x
    beq @next
    lda bomb_x, x
    sec
    sbc #WART_X
    bpl @dxp
    eor #$ff
    clc
    adc #1
@dxp:
    cmp #12
    bcs @next
    lda gy
    sec
    sbc bomb_y, x
    bpl @dyp
    eor #$ff
    clc
    adc #1
@dyp:
    cmp #12
    bcs @next
    lda #0
    sta bomb_a, x
    jsr getaway_crash
    rts
@next:
    inx
    cpx #N_BOMB
    bne @l
    rts
.endproc

; --------------------------------------------------------------------------
.proc build_getaway_hud
    ldx #0
    lda #' '
@clr:
    sta hudline, x
    inx
    cpx #32
    bne @clr
    lda #'L'
    sta hudline+0
    lda #'V'
    sta hudline+1
    lda #':'
    sta hudline+2
    lda lives
    clc
    adc #'0'
    sta hudline+3
    lda #'S'
    sta hudline+5
    lda #'H'
    sta hudline+6
    lda #':'
    sta hudline+7
    ldx #0
@pl:
    cpx shield
    bcs @pe
    lda #$07
    jmp @pp
@pe:
    lda #' '
@pp:
    sta hudline+8, x
    inx
    cpx #3
    bne @pl
    lda boss_on
    bne @boss
    ; distance meter
    lda #'D'
    sta hudline+12
    lda #'I'
    sta hudline+13
    lda #'S'
    sta hudline+14
    lda #'T'
    sta hudline+15
    lda #':'
    sta hudline+16
    lda dist_hi
    lsr a
    sta tmp                 ; filled = dist_hi/2 (0..8)
    jmp @bar
@boss:
    ; chopper HP meter
    lda #'H'
    sta hudline+12
    lda #'E'
    sta hudline+13
    lda #'L'
    sta hudline+14
    lda #'O'
    sta hudline+15
    lda #':'
    sta hudline+16
    lda boss_hp
    sta tmp                 ; filled = boss_hp (0..8)
@bar:
    ldx #0
@bl:
    cpx tmp
    bcs @be
    lda #$07
    jmp @bp
@be:
    lda #'-'
@bp:
    sta hudline+17, x
    inx
    cpx #8
    bne @bl
    lda #<hudline
    sta ptr
    lda #>hudline
    sta ptr+1
    lda #32
    sta tmp2
    lda #$20
    sta tmp3
    lda #$20
    sta tmp4
    jsr vbuf_add
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_getaway
    lda #0
    sta oam_idx
    ; warthog (blink while invulnerable)
    lda iframes
    beq @dw
    lda frame
    and #4
    bne @dw
    jmp @phase
@dw:
    lda #WART_X
    sta tmp
    lda gy
    sta tmp2
    lda #$20
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_meta16
@phase:
    lda boss_on
    beq @traffic
    jsr draw_boss
    jmp @para
@traffic:
    jsr draw_hazards
@para:
    jsr draw_streaks
    jsr draw_clouds
    jsr hide_rest_oam
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_hazards
    lda #0
    sta obloop
@ol:
    ldx obloop
    lda ob_active, x
    beq @onext
    lda ob_x, x
    sta tmp
    lda ob_y, x
    sta tmp2
    ldy ob_type, x
    lda obtile, y
    sta tmp3
    lda obpal, y
    sta tmp4
    jsr draw_meta16
@onext:
    inc obloop
    lda obloop
    cmp #N_OBST
    bne @ol
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_boss
    ; chopper: two 16x16 halves
    lda boss_x
    sta tmp
    lda boss_y
    sta tmp2
    lda #$2c
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_meta16
    lda boss_x
    clc
    adc #16
    sta tmp
    lda boss_y
    sta tmp2
    lda #$30
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_meta16
    ; bombs
    lda #0
    sta obloop
@bl:
    ldx obloop
    lda bomb_a, x
    beq @bn
    lda bomb_x, x
    sta tmp
    lda bomb_y, x
    sta tmp2
    lda #$36
    sta tmp3
    lda #3
    sta tmp4
    jsr draw_spr8x16
@bn:
    inc obloop
    lda obloop
    cmp #N_BOMB
    bne @bl
    ; bullets
    lda #0
    sta obloop
@ul:
    ldx obloop
    lda bull_a, x
    beq @un
    lda bull_x, x
    sta tmp
    lda bull_y, x
    sta tmp2
    lda #$34
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_spr8x16
@un:
    inc obloop
    lda obloop
    cmp #N_BULL
    bne @ul
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_streaks
    lda #0
    sta obloop
@l:
    ldx obloop
    lda streak_x, x
    sta tmp
    lda streak_y, x
    sta tmp2
    lda #$3a
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_spr8x16
    inc obloop
    lda obloop
    cmp #N_STREAK
    bne @l
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_clouds
    lda #0
    sta obloop
@l:
    ldx obloop
    lda cloud_x, x
    sta tmp
    lda cloud_y, x
    sta tmp2
    lda #$3c
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_meta16
    inc obloop
    lda obloop
    cmp #N_CLOUD
    bne @l
    rts
.endproc

; append one 8x16 sprite:  tmp = x, tmp2 = y, tmp3 = tile base, tmp4 = pal
.proc draw_spr8x16
    ldx oam_idx
    lda tmp2
    sta oam, x
    inx
    lda tmp3
    ora #$01
    sta oam, x
    inx
    lda tmp4
    sta oam, x
    inx
    lda tmp
    sta oam, x
    inx
    stx oam_idx
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_getaway_scene
    bit PPUSTATUS
    lda #$20
    sta PPUADDR
    lda #$00
    sta PPUADDR
    ldx #0
@row:
    lda gw_row_tile, x
    ldy #32
@col:
    sta PPUDATA
    dey
    bne @col
    inx
    cpx #30
    bne @row
    ldy #64
    lda #0
@attr:
    sta PPUDATA
    dey
    bne @attr
    rts
.endproc

.proc load_pal_getaway
    lda #<palette_getaway
    sta ptr
    lda #>palette_getaway
    sta ptr+1
    jmp load_palette
.endproc

; --------------------------------------------------------------------------
;  Write a nul-terminated string.  ptr -> string, A:X preloaded via PUTS.
;  On entry PPUADDR must already be latched by the PUTS macro.
; --------------------------------------------------------------------------
.proc puts
    ldy #0
:   lda (ptr), y
    beq @done
    sta PPUDATA
    iny
    bne :-
@done:
    rts
.endproc

; --------------------------------------------------------------------------
;  A / 10 -> tmp, A mod 10 -> tmp2
; --------------------------------------------------------------------------
.proc split_tens
    ldx #0
:   cmp #10
    bcc @done
    sec
    sbc #10
    inx
    jmp :-
@done:
    stx tmp
    sta tmp2
    rts
.endproc

; ===========================================================================
;  Rendering helpers
; ===========================================================================
.proc render_play
    lda #0
    sta oam_idx

    ; player (blink while invulnerable)
    lda iframes
    beq @draw
    lda frame
    and #$04
    bne @draw
    jmp @cars
@draw:
    lda px
    sta tmp
    lda py
    sta tmp2
    lda pframe
    and #1
    bne @fb
    lda #$02
    jmp @sb
@fb:
    lda #$06
@sb:
    sta tmp3
    lda #0
    sta tmp4
    jsr draw_meta16
@cars:
    jsr draw_cars
    jsr hide_rest_oam
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_cars
    lda #0
    sta carloop
loop:
    ldx carloop
    lda carXhi, x
    cmp #240
    bcs @next
    sta tmp
    lda slot_lane, x
    tay
    lda lane_y, y
    sta tmp2
    lda lane_tile, y
    sta tmp3
    lda lane_pal, y
    sta tmp4
    jsr draw_meta16
@next:
    inc carloop
    lda carloop
    cmp #NUM_CARS
    bne loop
    rts
.endproc

; --------------------------------------------------------------------------
;  Emit a 16x16 metasprite (two 8x16 sprites) into shadow OAM.
;   tmp = x, tmp2 = y, tmp3 = tile base (even), tmp4 = palette (0-3)
; --------------------------------------------------------------------------
.proc draw_meta16
    ldx oam_idx
    ; left column
    lda tmp2
    sta oam, x
    inx
    lda tmp3
    ora #$01
    sta oam, x
    inx
    lda tmp4
    sta oam, x
    inx
    lda tmp
    sta oam, x
    inx
    ; right column
    lda tmp2
    sta oam, x
    inx
    lda tmp3
    clc
    adc #2
    ora #$01
    sta oam, x
    inx
    lda tmp4
    sta oam, x
    inx
    lda tmp
    clc
    adc #8
    sta oam, x
    inx
    stx oam_idx
    rts
.endproc

; --------------------------------------------------------------------------
.proc hide_rest_oam
    ldx oam_idx
    lda #$ff
:   sta oam, x
    inx
    bne :-
    rts
.endproc

.proc hide_all_oam
    lda #0
    sta oam_idx
    jsr hide_rest_oam
    rts
.endproc

; --------------------------------------------------------------------------
.proc build_hud
    ldx #0
    lda #' '
@clr:
    sta hudline, x
    inx
    cpx #32
    bne @clr

    ldx #0
@l1:
    lda tmpl_lives, x
    sta hudline, x
    inx
    cpx #6
    bne @l1
    ldx #0
@l2:
    lda tmpl_level, x
    sta hudline+10, x
    inx
    cpx #6
    bne @l2
    ldx #0
@l3:
    lda tmpl_shield, x
    sta hudline+20, x
    inx
    cpx #7
    bne @l3

    lda lives
    clc
    adc #'0'
    sta hudline+6
    lda level
    clc
    adc #'0'
    sta hudline+16

    ldx #0
@pl:
    cpx shield
    bcs @empty
    lda #$07
    jmp @put
@empty:
    lda #' '
@put:
    sta hudline+27, x
    inx
    cpx #3
    bne @pl

    lda #<hudline
    sta ptr
    lda #>hudline
    sta ptr+1
    lda #32
    sta tmp2
    lda #$20
    sta tmp3
    lda #$20                ; nametable row 1 ($2020): clears TV overscan
    sta tmp4
    jsr vbuf_add
    rts
.endproc

; ===========================================================================
;  PPU / VRAM helpers
; ===========================================================================
.proc ppu_off
    lda #0
    sta PPUMASK
    sta PPUCTRL
    rts
.endproc

.proc ppu_on
    lda ppuctrl_val
    sta PPUCTRL
    lda #%00011110
    sta PPUMASK
    lda #0
    sta PPUSCROLL
    sta PPUSCROLL
    rts
.endproc

; --------------------------------------------------------------------------
.proc clear_nametable
    bit PPUSTATUS
    lda #$20
    sta PPUADDR
    lda #$00
    sta PPUADDR
    lda #0
    ldy #4
    ldx #0
@loop:
    sta PPUDATA
    inx
    bne @loop
    dey
    bne @loop
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_field
    bit PPUSTATUS
    lda #$20
    sta PPUADDR
    lda #$00
    sta PPUADDR
    ldx #0                  ; row
@row:
    lda row_tile, x
    ldy #32
@col:
    sta PPUDATA
    dey
    bne @col
    inx
    cpx #30
    bne @row
    ; attributes -> all palette 0
    ldy #64
    lda #0
@attr:
    sta PPUDATA
    dey
    bne @attr
    rts
.endproc

; --------------------------------------------------------------------------
; load 32 palette bytes from (ptr)
.proc load_palette
    bit PPUSTATUS
    lda #$3f
    sta PPUADDR
    lda #$00
    sta PPUADDR
    ldy #0
:   lda (ptr), y
    sta PPUDATA
    iny
    cpy #32
    bne :-
    rts
.endproc

.proc load_pal_game
    lda #<palette
    sta ptr
    lda #>palette
    sta ptr+1
    jmp load_palette
.endproc

.proc load_pal_pack
    lda #<palette_pack
    sta ptr
    lda #>palette_pack
    sta ptr+1
    jmp load_palette
.endproc

; --------------------------------------------------------------------------
;  Draw a script of text runs to the nametable (rendering off).
;   ptr -> [addrHi, addrLo, len, len bytes...] ... terminated by addrHi 0
; --------------------------------------------------------------------------
.proc draw_script
    ldy #0
loop:
    lda (ptr), y
    beq done
    sta PPUADDR
    iny
    lda (ptr), y
    sta PPUADDR
    iny
    lda (ptr), y
    sta tmp
    iny
copy:
    lda (ptr), y
    sta PPUDATA
    iny
    dec tmp
    bne copy
    jmp loop
done:
    rts
.endproc

; ===========================================================================
;  Music engine (frame driven)
; ===========================================================================
.proc music_tick
    lda mus_on
    bne :+
    rts
:   jsr noise_decay
    inc mus_tick
    lda mus_tick
    cmp #TEMPO
    bcc done
    lda #0
    sta mus_tick
    inc mus_step
    lda mus_step
    cmp #SONG_LEN
    bcc :+
    lda #0
    sta mus_step
:   jsr play_row
done:
    rts
.endproc

.proc play_row
    ldx mus_step
    lda song_mel, x
    jsr set_pulse1
    ldx mus_step
    lda song_harm, x
    jsr set_pulse2
    ldx mus_step
    lda song_bass, x
    jsr set_tri
    ldx mus_step
    lda song_perc, x
    jsr set_perc
    rts
.endproc

.proc set_pulse1
    cmp #NOTE_HOLD
    beq @ret
    cmp #NOTE_REST
    bne @play
    lda #%00110000
    sta $4000
    rts
@play:
    tay
    lda #%10111000
    sta $4000
    lda pulse_lo, y
    sta $4002
    lda pulse_hi, y
    ora #$08
    sta $4003
@ret:
    rts
.endproc

.proc set_pulse2
    cmp #NOTE_HOLD
    beq @ret
    cmp #NOTE_REST
    bne @play
    lda #%00110000
    sta $4004
    rts
@play:
    tay
    lda #%01110110
    sta $4004
    lda pulse_lo, y
    sta $4006
    lda pulse_hi, y
    ora #$08
    sta $4007
@ret:
    rts
.endproc

.proc set_tri
    cmp #NOTE_HOLD
    beq @ret
    cmp #NOTE_REST
    bne @play
    lda #$00
    sta $4008
    rts
@play:
    tay
    lda #$81
    sta $4008
    lda tri_lo, y
    sta $400a
    lda tri_hi, y
    ora #$08
    sta $400b
@ret:
    rts
.endproc

.proc set_perc
    cmp #0
    bne @go
    rts
@go:
    cmp #1
    bne @snare
    lda #$0c
    sta $400e
    lda #$06
    sta noise_vol
    jmp @trig
@snare:
    lda #$08
    sta $400e
    lda #$0a
    sta noise_vol
@trig:
    lda noise_vol
    ora #%00110000
    sta $400c
    lda #$08
    sta $400f
    rts
.endproc

.proc noise_decay
    lda noise_vol
    beq @done
    dec noise_vol
    lda noise_vol
    ora #%00110000
    sta $400c
@done:
    rts
.endproc

; ===========================================================================
;  Data
; ===========================================================================
.segment "RODATA"

.include "music.inc"

palette:
    ; background palettes (all the same: black, asphalt, white, yellow)
    .byte $0f,$00,$30,$28
    .byte $0f,$00,$30,$28
    .byte $0f,$00,$30,$28
    .byte $0f,$00,$30,$28
    ; sprite palettes
    .byte $0f,$27,$12,$16   ; 0 player: skin, shirt, console
    .byte $0f,$0f,$30,$16   ; 1 red car/van: tire, window, red body
    .byte $0f,$0f,$2a,$30   ; 2 patrol rig/warthog: tire, green, white
    .byte $0f,$17,$16,$30   ; 3 moose/console: brown, red, white

palette_pack:
    ; background: black, grey(empty cell), red(crate fill), white(wall/text)
    .byte $0f,$07,$16,$30
    .byte $0f,$07,$16,$30
    .byte $0f,$07,$16,$30
    .byte $0f,$07,$16,$30
    ; sprite palettes (same as the run; colour the falling pieces)
    .byte $0f,$27,$12,$16
    .byte $0f,$0f,$30,$16
    .byte $0f,$0f,$2a,$30
    .byte $0f,$17,$16,$30

palette_getaway:
    ; background: 0 black (HUD/text bg), 1 sky-blue, 2 ground-brown, 3 white
    .byte $0f,$21,$17,$30
    .byte $0f,$21,$17,$30
    .byte $0f,$21,$17,$30
    .byte $0f,$21,$17,$30
    ; sprite palettes (same as the run)
    .byte $0f,$27,$12,$16
    .byte $0f,$0f,$30,$16
    .byte $0f,$0f,$2a,$30
    .byte $0f,$17,$16,$30

; getaway hazard metasprite base + palette, indexed by ob_type
obtile:
    .byte $10, $14, $1c, $28   ; patrol car, rig, moose, boulder
obpal:
    .byte 1, 2, 3, 3

; getaway scene: nametable fill tile per row (30 rows)
gw_row_tile:
    .byte $00,$00                            ; rows 0-1 black HUD bar
    .byte $0e,$0e,$0e,$0e,$0e,$0e            ; rows 2-7  sky
    .byte $0e,$0e,$0e,$0e,$0e,$0e,$0e,$0e    ; rows 8-15 sky
    .byte $0c                                ; row 16 horizon
    .byte $0b,$0d,$0b,$0b,$0d,$0b            ; rows 17-22 ground + lane dashes
    .byte $0b,$0d,$0b,$0b,$0b,$0b,$0b        ; rows 23-29 ground

; nametable fill tile per tile-row (30 rows)
row_tile:
    .byte $00,$00           ; HUD
    .byte $05,$05           ; goal checker
    .byte $02,$03           ; lane0
    .byte $02,$03           ; lane1
    .byte $02,$03           ; lane2
    .byte $02,$03           ; lane3
    .byte $04,$04           ; median
    .byte $02,$03           ; lane4
    .byte $02,$03           ; lane5
    .byte $02,$03           ; lane6
    .byte $02,$03           ; lane7
    .byte $01,$01           ; grass
    .byte $01,$01           ; grass
    .byte $01,$01           ; start grass
    .byte $01,$01           ; grass

; per-lane pixel Y (top of the 16px band)
lane_y:
    .byte 32,48,64,80,112,128,144,160

; per-lane metasprite tile base
lane_tile:
    .byte $10,$14,$18,$1c,$20,$10,$14,$1c

; per-lane sprite palette
lane_pal:
    .byte 1,2,1,3,2,1,2,3

; slot -> lane
slot_lane:
    .byte 0,0,0, 1,1,1, 2,2,2, 3,3,3, 4,4,4, 5,5,5, 6,6,6, 7,7,7

; slot -> initial x
car_init:
    .byte 0,84,168, 40,124,208, 80,164,248, 120,204,32
    .byte 160,244,72, 200,28,112, 240,68,152, 24,108,192

; band (py>>4) -> lane, $ff safe, $fe goal
bandLane:
    .byte $ff,$fe,0,1,2,3,$ff,4,5,6,7,$ff,$ff,$ff

; lane speeds (8.8 signed) per level; +right / -left
spd_lo_lvl:
    .byte .lobyte(96),.lobyte(-128),.lobyte(80),.lobyte(-144)
    .byte .lobyte(112),.lobyte(-160),.lobyte(64),.lobyte(-176)
    .byte .lobyte(136),.lobyte(-168),.lobyte(120),.lobyte(-184)
    .byte .lobyte(152),.lobyte(-200),.lobyte(104),.lobyte(-216)
    .byte .lobyte(176),.lobyte(-208),.lobyte(160),.lobyte(-224)
    .byte .lobyte(192),.lobyte(-240),.lobyte(144),.lobyte(-248)
spd_hi_lvl:
    .byte .hibyte(96),.hibyte(-128),.hibyte(80),.hibyte(-144)
    .byte .hibyte(112),.hibyte(-160),.hibyte(64),.hibyte(-176)
    .byte .hibyte(136),.hibyte(-168),.hibyte(120),.hibyte(-184)
    .byte .hibyte(152),.hibyte(-200),.hibyte(104),.hibyte(-216)
    .byte .hibyte(176),.hibyte(-208),.hibyte(160),.hibyte(-224)
    .byte .hibyte(192),.hibyte(-240),.hibyte(144),.hibyte(-248)

tmpl_lives:  .byte "LIVES:"
tmpl_level:  .byte "LEVEL:"
tmpl_shield: .byte "SHIELD:"

.macro TEXT row, col, s
    .byte >(NT + (row)*32 + (col))
    .byte <(NT + (row)*32 + (col))
    .byte .strlen(s)
    .byte s
.endmacro

txt_title:
    TEXT 3, 11, "BORDER RUN"
    TEXT 6,  4, "SMUGGLE A GENESIS NORTH"
    TEXT 8,  9, "GENESIS+CD+32X"
    TEXT 10, 10, "THE HARD WAY"
    TEXT 18, 10, "PRESS START"
    TEXT 22, 7, "MOVE WITH THE DPAD"
    TEXT 24, 7, "SHIELD = HALO TECH"
    .byte 0

txt_level:
    TEXT 8,  9, "BORDER CROSSED"
    TEXT 10, 13, "LEVEL"
    .byte 0

txt_over:
    TEXT 10, 6, "BUSTED AT THE BORDER"
    TEXT 13, 11, "GAME OVER"
    TEXT 18, 10, "PRESS START"
    .byte 0

txt_win:
    TEXT 9,  7, "WELCOME TO CANADA"
    TEXT 12, 8, "YOU SMUGGLED IT"
    TEXT 14, 6, "GENESIS DELIVERED EH"
    TEXT 16, 4, "CRATES PACKED"
    TEXT 20, 10, "PRESS START"
    .byte 0

; packing-stage strings (nul terminated for puts)
str_packhdr:  .byte "PACK YOUR COLON", 0
str_packsub:  .byte "STUFF THE SEGA GEAR IN", 0
str_next:     .byte "NEXT", 0
str_crates:   .byte "CRATES", 0
str_ctrl1:    .byte "DPAD MOVE   A SPIN", 0
str_ctrl2:    .byte "UP DROP   START RUN", 0

.include "pieces.inc"

; ===========================================================================
.segment "CHARS"
    .incbin "chr.bin"

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq
