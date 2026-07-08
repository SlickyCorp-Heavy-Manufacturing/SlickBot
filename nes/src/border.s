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
    .byte $02              ; 2 x 16 KB PRG  (NROM-256, 32 KB)
    .byte $01              ; 1 x 8  KB CHR
    .byte $02              ; flags6: mapper 0, horizontal mirror, battery WRAM
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
ST_INTRO  = 8
ST_BONUS  = 9

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
PACK_SECS  = 30         ; placement-stage countdown seconds
NEXT_PX    = 184        ; NEXT-preview pixel origin
NEXT_PY    = 72

; getaway (side-scroller) stage
N_OBST     = 6          ; simultaneous hazards
WART_X     = 40         ; warthog fixed screen x
PASSLINE   = 48         ; x a hazard crosses to count as a dodge
GY_MIN     = 140        ; warthog vertical range on the road
GY_MAX     = 188
GT_TARGET  = 16        ; distance before the boss chopper arrives
N_CLOUD    = 3          ; background parallax clouds
N_STREAK   = 4          ; foreground parallax speed streaks
N_BOMB     = 3          ; chopper bombs in flight
N_BULL     = 2          ; player bullets in flight
N_PU       = 2          ; getaway power-ups in flight
BOSS_HP    = 8          ; hits to down the chopper (also HP-bar cells)
FIRE_CD    = 10         ; frames between player shots
BOSS_X0    = 200        ; chopper hover x

PLAYER_X0  = 120
PLAYER_Y0  = 208
GOAL_Y     = 16
TEMPO      = 14
HITBOX     = 12
NT         = $2000

; sound-effect ids (pulse2 tonal slot)
SFX_HOP    = 0
SFX_PLACE  = 1
SFX_SHOOT  = 2
SFX_CROSS  = 3
SFX_START  = 4
SFX_SHIELD = 5
SFX_ERROR  = 6
SFX_BOSSHIT = 7
SFX_HONK   = 8
; sound-effect ids (noise burst slot)
SFXN_HIT   = 0
SFXN_BOOM  = 1
SFXN_DEATH = 2

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
win_wx:       .res 1   ; warthog x during the victory drive-in
difficulty:   .res 1   ; 0 easy, 1 normal, 2 hard
shake_tmr:    .res 1   ; screen-shake frames remaining
flash_tmr:    .res 1   ; white-flash frames remaining
paused:       .res 1   ; 1 while the game is paused
combo:        .res 1   ; current dodge combo count (getaway)
combo_tmr:    .res 1   ; frames left before the combo decays
intro_page:   .res 1   ; current intro-cutscene page
bonus_tmr:    .res 1   ; bonus-round countdown
bonus_hits:   .res 1   ; stamps collected in the bonus round
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
; --- placement (Resident-Evil-style) packing state ---
cur_type:   .res 1     ; console being placed (0=game gear,1=genesis,2=tower)
next_type:  .res 1
cur_col:    .res 1     ; cursor grid position
cur_row:    .res 1
pack_secs:  .res 1     ; countdown seconds
subtick:    .res 1     ; frames within the current second
ncons:      .res 1     ; consoles packed
pflash:     .res 1     ; "no fit" flash timer
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
boss_pat:   .res 1     ; boss attack pattern (0=sweep, 1=dive)
boss_pat_t: .res 1     ; frames until pattern switch
boss_flash: .res 1     ; hit-blink frames remaining
boss_rage:  .res 1     ; 1 once the chopper enters its berserk phase
fire_cd:    .res 1     ; player shot cooldown
score_lo:   .res 1     ; running score (16-bit)
score_hi:   .res 1
hisc_lo:    .res 1     ; session high score
hisc_hi:    .res 1
mus_step:   .res 1
mus_tick:   .res 1
mus_on:     .res 1
noise_vol:  .res 1
song_mel_p:  .res 2     ; pointers into the current song's voice arrays
song_harm_p: .res 2
song_bass_p: .res 2
song_perc_p: .res 2
song_len:    .res 1
song_tempo:  .res 1
mtmp:        .res 1
; --- sound effects (pulse2 tonal slot + noise burst slot) ---
sfxp_dur:   .res 1
sfxp_perlo: .res 1
sfxp_perhi: .res 1
sfxp_step:  .res 1
sfxp_vol:   .res 1
sfxp_dec:   .res 1
sfxn_dur:   .res 1
sfxn_per:   .res 1
sfxn_step:  .res 1
sfxn_vol:   .res 1
sfxn_dec:   .res 1
sfxtmp:     .res 1

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
ob_spd:     .res N_OBST     ; per-hazard leftward speed
scorebuf:   .res 5          ; 5-digit decimal score
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
pu_active:  .res N_PU       ; getaway power-ups
pu_x:       .res N_PU
pu_y:       .res N_PU
pu_type:    .res N_PU       ; 0 poutine (shield), 1 extra life, 2 maple star

; ---- battery-backed PRG-RAM ($6000): survives power cycles ----------------
.segment "SRAM"
sram_sig:   .res 4          ; magic signature ("BRUN") validating the save
sram_hi_lo: .res 1          ; persisted all-time high score (16-bit)
sram_hi_hi: .res 1
sram_diff:  .res 1          ; last chosen difficulty (0=easy,1=normal,2=hard)

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

    jsr load_save          ; pull persistent high score + difficulty from WRAM

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

    ; hit-flash: whiten the backdrop for a few frames on impact
    bit PPUSTATUS
    lda #$3f
    sta PPUADDR
    lda #$00
    sta PPUADDR
    lda flash_tmr
    beq @noflash
    dec flash_tmr
    lda #$30                ; white
    sta PPUDATA
    jmp @flashdone
@noflash:
    lda #$0f                ; normal black backdrop
    sta PPUDATA
@flashdone:
    ; reset VRAM address latch back to the top of the nametable
    bit PPUSTATUS

    lda ppuctrl_val
    sta PPUCTRL
    lda #%00011110
    sta PPUMASK
    ; screen shake: jitter the scroll a few pixels while active
    lda shake_tmr
    beq @noshake
    dec shake_tmr
    lda frame
    and #2                  ; toggles 0 / 2
    tax
    stx PPUSCROLL           ; x scroll jitter
    lda frame
    and #1
    asl a                   ; toggles 0 / 2
    sta PPUSCROLL           ; y scroll jitter
    jmp @scrolldone
@noshake:
    lda #0
    sta PPUSCROLL
    sta PPUSCROLL
@scrolldone:

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
    ; SELECT pauses the action stages (crossing, packing, getaway)
    lda state
    cmp #ST_PLAY
    beq @pausable
    cmp #ST_PACK
    beq @pausable
    cmp #ST_GETAWAY
    beq @pausable
    jmp @dispatch
@pausable:
    lda paused
    bne @ispaused
    lda pad1_new
    and #BTN_SEL
    beq @dispatch
    jsr pause_enter
    rts
@ispaused:
    lda pad1_new
    and #BTN_SEL
    beq @frozen
    jsr pause_leave
@frozen:
    rts
@dispatch:
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
    .word do_intro
    .word do_bonus
.endproc

; --------------------------------------------------------------------------
;  Pause: blank the field to a PAUSED card, freeze logic, hide sprites.
; --------------------------------------------------------------------------
.proc pause_enter
    lda #1
    sta paused
    lda #0
    sta shake_tmr
    sta flash_tmr
    jsr ppu_off
    jsr clear_nametable
    PUTS txt_paused,   (NT + 13*32 + 13)
    PUTS txt_pauseres, (NT + 16*32 +  8)
    jsr hide_all_oam
    jsr ppu_on
    rts
.endproc

; resume: rebuild the current stage's scene, then let it run next frame
.proc pause_leave
    lda #0
    sta paused
    lda state
    cmp #ST_PACK
    beq @pack
    cmp #ST_GETAWAY
    beq @getaway
    ; crossing
    jsr ppu_off
    jsr load_pal_game
    jsr clear_nametable
    jsr draw_field
    lda #1
    sta hud_dirty
    jsr ppu_on
    rts
@getaway:
    jsr ppu_off
    jsr load_pal_getaway
    jsr clear_nametable
    jsr draw_getaway_scene
    jsr ppu_on
    rts
@pack:
    jsr ppu_off
    jsr load_pal_pack
    jsr clear_nametable
    jsr draw_bin_frame
    jsr draw_pack_labels
    jsr redraw_bin
    jsr ppu_on
    ; re-post the live TIME / SEGAS numbers
    lda #>(NT + 21*32 + 10)
    sta tmp3
    lda #<(NT + 21*32 + 10)
    sta tmp4
    lda pack_secs
    jsr queue_num2
    lda #>(NT + 21*32 + 20)
    sta tmp3
    lda #<(NT + 21*32 + 20)
    sta tmp4
    lda ncons
    jsr queue_num2
    rts
.endproc

; ===========================================================================
;  TITLE
; ===========================================================================
; The title screen is a live demo of the getaway stage: the road streams by,
; traffic and hazards fly in, and a self-driving Warthog auto-dodges them, all
; behind a black title banner overlaid across the top of the screen.
.proc enter_title
    jsr ppu_off
    lda #%10100000          ; 8x16 sprite mode
    sta ppuctrl_val
    jsr load_pal_getaway
    jsr clear_nametable
    jsr draw_getaway_scene
    jsr draw_title_banner
    jsr reset_getaway_state
    jsr draw_diff_word
    lda #1
    sta mus_on
    lda #SONG_TITLE
    jsr music_play
    jsr ppu_on
    rts
.endproc

; overlay a black title banner (rows 0-5) with the game running underneath
.proc draw_title_banner
    bit PPUSTATUS
    lda #$20
    sta PPUADDR
    lda #$00
    sta PPUADDR
    ldx #0
    lda #$00                ; blank/black tile
@l:
    sta PPUDATA
    inx
    cpx #192                ; rows 0-5 (6 * 32)
    bne @l
    lda #<txt_overlay
    sta ptr
    lda #>txt_overlay
    sta ptr+1
    jsr draw_script
    jsr hiscore_digits
    lda #>(NT + 5*32 + 16)
    sta PPUADDR
    lda #<(NT + 5*32 + 16)
    sta PPUADDR
    jsr put_scorebuf
    rts
.endproc

.proc do_title
    lda pad1_new
    and #BTN_START
    beq @nostart
    jsr new_game
    rts
@nostart:
    ; UP = harder, DOWN = easier
    lda pad1_new
    and #BTN_UP
    beq @nu
    lda difficulty
    cmp #2
    bcs @nu
    inc difficulty
    jsr save_diff
    jsr draw_diff_word
    lda #SFX_HOP
    jsr sfx_p
@nu:
    lda pad1_new
    and #BTN_DOWN
    beq @demo
    lda difficulty
    beq @demo
    dec difficulty
    jsr save_diff
    jsr draw_diff_word
    lda #SFX_HOP
    jsr sfx_p
@demo:
    jsr title_auto_move     ; self-driving Warthog dodges the traffic
    jsr move_parallax
    jsr move_obstacles
    jsr spawn_tick
    jsr draw_getaway        ; warthog + hazards + parallax (banner is background)
    rts
.endproc

; persist the chosen difficulty to WRAM
.proc save_diff
    lda difficulty
    sta sram_diff
    rts
.endproc

; queue the current difficulty word onto the title banner (row 4, col 15)
.proc draw_diff_word
    lda difficulty
    cmp #2
    beq @hard
    cmp #1
    beq @norm
    lda #<diff_easy
    ldx #>diff_easy
    jmp @set
@norm:
    lda #<diff_norm
    ldx #>diff_norm
    jmp @set
@hard:
    lda #<diff_hard
    ldx #>diff_hard
@set:
    sta ptr
    stx ptr+1
    lda #6
    sta tmp2
    lda #>(NT + 4*32 + 15)
    sta tmp3
    lda #<(NT + 4*32 + 15)
    sta tmp4
    jsr vbuf_add
    rts
.endproc

; ---- attract-demo auto-pilot: steer the Warthog clear of incoming hazards --
.proc title_auto_move
    ldx #0
@l:
    lda ob_active, x
    beq @next
    lda ob_x, x
    sec
    sbc #WART_X
    bcc @next               ; hazard already behind us
    cmp #64
    bcs @next               ; hazard too far ahead to matter yet
    ; hazard is in our horizontal danger zone -- compare heights
    lda ob_y, x
    cmp gy
    bcc @above              ; hazard above the Warthog
    ; hazard at or below us: dodge up if it's close
    sec
    sbc gy
    cmp #24
    bcs @next               ; far below -> safe
    lda gy
    cmp #GY_MIN+2
    bcc @next
    dec gy
    dec gy
    rts
@above:
    lda gy
    sec
    sbc ob_y, x
    cmp #24
    bcs @next               ; far above -> safe
    lda gy
    cmp #GY_MAX-1
    bcs @next
    inc gy
    inc gy
    rts
@next:
    inx
    cpx #N_OBST
    bne @l
    ; no threat -- ease back toward the middle of the road
    lda gy
    cmp #166
    bcs @up
    cmp #162
    bcc @down
    rts
@up:
    dec gy
    rts
@down:
    inc gy
    rts
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
    sta score_lo
    sta score_hi
    lda #ST_INTRO
    sta state
    jsr enter_intro
    rts
.endproc

; ===========================================================================
;  INTRO CUTSCENE  --  the briefing before the packing job.
; ===========================================================================
.proc enter_intro
    jsr ppu_off
    lda #%10000000
    sta ppuctrl_val
    jsr load_pal_game
    lda #0
    sta intro_page
    jsr draw_intro_page
    jsr hide_all_oam
    lda #1
    sta mus_on
    lda #SONG_TITLE
    jsr music_play
    jsr ppu_on
    rts
.endproc

.proc do_intro
    lda pad1_new
    and #BTN_START
    beq @ret
    inc intro_page
    lda intro_page
    cmp #2
    bcc @next
    ; briefing done -> begin packing
    lda #ST_PACK
    sta state
    lda #SFX_START
    jsr sfx_p
    jsr enter_pack
    rts
@next:
    lda #SFX_HOP
    jsr sfx_p
    jsr draw_intro_page
@ret:
    rts
.endproc

.proc draw_intro_page
    jsr ppu_off
    jsr clear_nametable
    lda intro_page
    bne @p1
    lda #<txt_intro0
    ldx #>txt_intro0
    jmp @go
@p1:
    lda #<txt_intro1
    ldx #>txt_intro1
@go:
    sta ptr
    stx ptr+1
    jsr draw_script
    jsr ppu_on
    rts
.endproc

; ===========================================================================
;  BONUS ROUND  --  DUTY FREE DASH.  Between the chopper and the finale you
;  get a timed catch game: gold loot rains down, slide left/right to bag it.
; ===========================================================================
.proc enter_bonus
    jsr ppu_off
    lda #%10100000          ; 8x16 sprites
    sta ppuctrl_val
    jsr load_pal_getaway
    jsr clear_nametable
    jsr draw_getaway_scene
    lda #12
    sta bonus_tmr
    jsr draw_bonus_banner
    ldx #0
    lda #0
:   sta ob_active, x
    inx
    cpx #N_OBST
    bne :-
    lda #120
    sta px
    lda #180
    sta py
    lda #59
    sta subtick
    lda #0
    sta bonus_hits
    lda #10
    sta spawn_tmr
    lda #22
    sta spawn_per
    lda #1
    sta mus_on
    lda #SONG_CROSS
    jsr music_play
    jsr ppu_on
    ; post the starting timer value
    lda #>(NT + 3*32 + 20)
    sta tmp3
    lda #<(NT + 3*32 + 20)
    sta tmp4
    lda bonus_tmr
    jsr queue_num2
    rts
.endproc

; black banner (rows 0-4) over the road scene
.proc draw_bonus_banner
    bit PPUSTATUS
    lda #$20
    sta PPUADDR
    lda #$00
    sta PPUADDR
    ldx #0
    lda #$00
@l:
    sta PPUDATA
    inx
    cpx #160                ; rows 0-4
    bne @l
    lda #<txt_bonus
    sta ptr
    lda #>txt_bonus
    sta ptr+1
    jsr draw_script
    rts
.endproc

.proc do_bonus
    dec subtick
    bpl @notick
    lda #59
    sta subtick
    lda bonus_tmr
    beq @timeup
    dec bonus_tmr
    lda #>(NT + 3*32 + 20)
    sta tmp3
    lda #<(NT + 3*32 + 20)
    sta tmp4
    lda bonus_tmr
    jsr queue_num2
@notick:
    lda bonus_tmr
    bne @play
    ; safety: time already zero
@timeup:
    lda #ST_WIN
    sta state
    jsr enter_win
    rts
@play:
    lda pad1
    and #BTN_LEFT
    beq @nl
    lda px
    cmp #16
    bcc @nl
    dec px
    dec px
@nl:
    lda pad1
    and #BTN_RIGHT
    beq @nr
    lda px
    cmp #224
    bcs @nr
    inc px
    inc px
@nr:
    jsr bonus_items
    jsr bonus_spawn
    jsr draw_bonus
    rts
.endproc

.proc bonus_spawn
    dec spawn_tmr
    bne @ret
    lda spawn_per
    sta spawn_tmr
    ldx #0
@f:
    lda ob_active, x
    beq @found
    inx
    cpx #N_OBST
    bne @f
    rts
@found:
    lda #1
    sta ob_active, x
    lda #44                 ; just below the banner
    sta ob_y, x
    jsr update_rng
    lda rng
    and #$7f
    clc
    adc #24
    sta ob_x, x
@ret:
    rts
.endproc

.proc bonus_items
    ldx #0
@l:
    lda ob_active, x
    beq @next
    lda ob_y, x
    clc
    adc #3
    cmp #200
    bcs @miss
    sta ob_y, x
    cmp py
    bcc @next               ; still above the catcher
    lda ob_x, x
    sec
    sbc px
    bpl @dxp
    eor #$ff
    clc
    adc #1
@dxp:
    cmp #18
    bcs @next
    ; caught!
    lda #0
    sta ob_active, x
    inc bonus_hits
    lda #25
    jsr add_score
    lda #SFX_CROSS
    jsr sfx_p
    jmp @next
@miss:
    lda #0
    sta ob_active, x
@next:
    inx
    cpx #N_OBST
    bne @l
    rts
.endproc

.proc draw_bonus
    lda #0
    sta oam_idx
    ; the smuggler catcher
    lda px
    sta tmp
    lda py
    sta tmp2
    lda #$02
    sta tmp3
    lda #0
    sta tmp4
    jsr draw_meta16
    ; falling loot (gold stars)
    lda #0
    sta obloop
@l:
    ldx obloop
    lda ob_active, x
    beq @n
    lda ob_x, x
    sta tmp
    lda ob_y, x
    sta tmp2
    lda #$7c
    sta tmp3
    lda #1
    sta tmp4
    jsr draw_meta16
@n:
    inc obloop
    lda obloop
    cmp #N_OBST
    bne @l
    jsr hide_rest_oam
    rts
.endproc

; --------------------------------------------------------------------------
.proc setup_level
    jsr ppu_off
    lda #%10100000         ; back to 8x16 sprite mode for the run
    sta ppuctrl_val
    jsr load_pal_level
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
    lda #SONG_CROSS
    jsr music_play
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
    lda #SFX_HOP
    jsr sfx_p
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
    jsr fx_hit
    lda #IFRAMES
    sta iframes
    lda #PLAYER_Y0
    sta py
    lda #1
    sta hud_dirty
    lda #SFX_SHIELD
    jsr sfx_p
    rts
@lose:
    jsr fx_big
    dec lives
    lda #DEAD_TIME
    sta iframes          ; keep player flashing through the DEAD pause
    lda #1
    sta hud_dirty
    lda #ST_DEAD
    sta state
    lda #DEAD_TIME
    sta statetmr
    lda #SFXN_DEATH
    jsr sfx_n
    rts
.endproc

; --------------------------------------------------------------------------
.proc player_win
    lda #SFX_CROSS
    jsr sfx_p
    lda #50                 ; points for crossing
    jsr add_score
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
    ; drive the warthog in from the left, then park (honk once on arrival)
    lda win_wx
    cmp #88
    bcs @parked
    inc win_wx
    inc win_wx
    lda win_wx
    cmp #88
    bcc @parked
    lda #SFX_HONK
    jsr sfx_p
@parked:
    jsr draw_win_scene
    lda pad1_new
    and #BTN_START
    beq @ret
    jsr enter_title
    lda #ST_TITLE
    sta state
@ret:
    rts
.endproc

; --------------------------------------------------------------------------
;  Victory drive-in: warthog rolls in past a beaver while maple leaves fall.
; --------------------------------------------------------------------------
.proc draw_win_scene
    lda #0
    sta oam_idx
    ; warthog (two halves) at y 176
    lda win_wx
    sta tmp
    lda #176
    sta tmp2
    lda #$50
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_meta16
    lda win_wx
    clc
    adc #16
    sta tmp
    lda #176
    sta tmp2
    lda #$54
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_meta16
    ; beaver waving a hockey stick (32x32), bobbing gently
    lda #44
    sta tmp
    lda frame
    lsr a
    lsr a
    lsr a
    and #1
    clc
    adc #160
    sta tmp2
    lda #$80
    sta tmp3
    lda #3
    sta tmp4
    jsr draw_meta32
    ; Canadian flag (32x32) at x=8, bobbing gently
    lda #8
    sta tmp
    lda frame
    lsr a
    lsr a
    and #1
    clc
    adc #136
    sta tmp2
    lda #$90
    sta tmp3
    lda #3
    sta tmp4
    jsr draw_meta32
    ; two maple leaves tumbling down (vertical-flip toggles the tumble)
    lda frame
    and #$10
    beq @lf1
    lda #$81                ; palette 1 + vertical flip
    jmp @lf2
@lf1:
    lda #$01
@lf2:
    sta tmp4
    lda #176
    sta tmp
    lda frame
    and #$3f
    clc
    adc #36
    sta tmp2
    lda #$5c
    sta tmp3
    jsr draw_meta16
    lda frame
    clc
    adc #32
    and #$10
    beq @lf3
    lda #$81
    jmp @lf4
@lf3:
    lda #$01
@lf4:
    sta tmp4
    lda #208
    sta tmp
    lda frame
    clc
    adc #32
    and #$3f
    clc
    adc #48
    sta tmp2
    lda #$5c
    sta tmp3
    jsr draw_meta16
    ; fireworks bursting in the sky
    lda #40
    sta tmp
    lda #28
    sta tmp2
    lda #0
    sta tmp4
    lda frame
    and #$08
    jsr fw_tile
    jsr draw_meta16
    lda #128
    sta tmp
    lda #20
    sta tmp2
    lda #2
    sta tmp4
    lda frame
    and #$10
    jsr fw_tile
    jsr draw_meta16
    lda #200
    sta tmp
    lda #34
    sta tmp2
    lda #3
    sta tmp4
    lda frame
    clc
    adc #8
    and #$08
    jsr fw_tile
    jsr draw_meta16
    jsr hide_rest_oam
    rts
.endproc

; A = 0 -> small burst tile, nonzero -> big burst tile; result in tmp3
.proc fw_tile
    bne @big
    lda #$6c
    sta tmp3
    rts
@big:
    lda #$70
    sta tmp3
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
    jsr update_hiscore
    jsr score_digits
    lda #>(NT + 15*32 + 15)
    sta PPUADDR
    lda #<(NT + 15*32 + 15)
    sta PPUADDR
    jsr put_scorebuf
    jsr hiscore_digits
    lda #>(NT + 17*32 + 13)
    sta PPUADDR
    lda #<(NT + 17*32 + 13)
    sta PPUADDR
    jsr put_scorebuf
    jsr hide_all_oam
    lda #SONG_OVER
    jsr music_play
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
    ; crates delivered at row 9, col 23 (3 digits)
    lda #>(NT + 9*32 + 23)
    sta PPUADDR
    lda #<(NT + 9*32 + 23)
    sta PPUADDR
    jsr packed_digits
    lda cratebuf+0
    sta PPUDATA
    lda cratebuf+1
    sta PPUDATA
    lda cratebuf+2
    sta PPUDATA
    ; score / high score
    jsr update_hiscore
    jsr score_digits
    lda #>(NT + 11*32 + 15)
    sta PPUADDR
    lda #<(NT + 11*32 + 15)
    sta PPUADDR
    jsr put_scorebuf
    jsr hiscore_digits
    lda #>(NT + 13*32 + 13)
    sta PPUADDR
    lda #<(NT + 13*32 + 13)
    sta PPUADDR
    jsr put_scorebuf
    lda #0
    sta win_wx              ; warthog starts off the left edge
    jsr hide_all_oam
    lda #SONG_WIN
    jsr music_play
    jsr ppu_on
    rts
.endproc

; ===========================================================================
;  PACKING STAGE  --  Resident-Evil-style timed placement.  A countdown runs
;  while you slide Sega consoles (Game Gear, Genesis, Genesis+CD+32X tower)
;  around the colon grid and drop them to cram in as much gear as possible.
;  Fuller haul = bigger loot but a slower waddle on the run.
; ===========================================================================
.proc enter_pack
    jsr ppu_off
    lda #%10000000          ; NMI on, 8x8 sprites, bg + sprite pattern table 0
    sta ppuctrl_val
    jsr load_pal_pack
    jsr clear_nametable
    jsr draw_bin_frame
    jsr draw_pack_labels
    ldx #0
    lda #0
:   sta field, x
    inx
    cpx #PWH
    bne :-
    lda #0
    sta packed
    sta ncons
    sta pflash
    ldx difficulty
    lda pack_secs_diff, x
    sta pack_secs
    lda #59
    sta subtick
    jsr rand3
    sta next_type
    jsr spawn_item
    lda #>(NT + 21*32 + 10)
    sta tmp3
    lda #<(NT + 21*32 + 10)
    sta tmp4
    lda pack_secs
    jsr draw_num2
    lda #>(NT + 21*32 + 20)
    sta tmp3
    lda #<(NT + 21*32 + 20)
    sta tmp4
    lda ncons
    jsr draw_num2
    jsr hide_all_oam
    lda #1
    sta mus_on
    lda #SONG_PACK
    jsr music_play
    jsr ppu_on
    rts
.endproc

; --------------------------------------------------------------------------
.proc do_pack
    ; countdown
    dec subtick
    bpl @notick
    lda #59
    sta subtick
    lda pack_secs
    bne @havetime
    jmp @timeup
@havetime:
    dec pack_secs
    lda #>(NT + 21*32 + 10)
    sta tmp3
    lda #<(NT + 21*32 + 10)
    sta tmp4
    lda pack_secs
    jsr queue_num2
@notick:
    ; finish early
    lda pad1_new
    and #BTN_START
    beq @nstart
    jsr commit_loadout
    rts
@nstart:
    ; skip current console
    lda pad1_new
    and #BTN_B
    beq @nb
    lda #SFX_HOP
    jsr sfx_p
    jsr spawn_item
@nb:
    ; place
    lda pad1_new
    and #BTN_A
    beq @na
    jsr fits_here
    bne @nofit
    jsr place_here
    ldy cur_type
    lda packed
    clc
    adc item_ncells, y
    sta packed
    inc ncons
    jsr redraw_bin
    lda #>(NT + 21*32 + 20)
    sta tmp3
    lda #<(NT + 21*32 + 20)
    sta tmp4
    lda ncons
    jsr queue_num2
    lda #SFX_PLACE
    jsr sfx_p
    jsr spawn_item
    jmp @na
@nofit:
    lda #16
    sta pflash
    lda #SFX_ERROR
    jsr sfx_p
@na:
    ; movement
    lda pad1_new
    and #BTN_UP
    beq @nu
    lda cur_row
    beq @nu
    dec cur_row
@nu:
    lda pad1_new
    and #BTN_DOWN
    beq @nd
    ldy cur_type
    lda #PH
    sec
    sbc item_h, y
    sta tmp
    lda cur_row
    cmp tmp
    bcs @nd
    inc cur_row
@nd:
    lda pad1_new
    and #BTN_LEFT
    beq @nl
    lda cur_col
    beq @nl
    dec cur_col
@nl:
    lda pad1_new
    and #BTN_RIGHT
    beq @nr
    ldy cur_type
    lda #PW
    sec
    sbc item_w, y
    sta tmp
    lda cur_col
    cmp tmp
    bcs @nr
    inc cur_col
@nr:
    lda pflash
    beq @render
    dec pflash
@render:
    jsr draw_pack_render
    rts
@timeup:
    jsr commit_loadout
    rts
.endproc

; --------------------------------------------------------------------------
.proc spawn_item
    lda next_type
    sta cur_type
    jsr rand3
    sta next_type
    lda #0
    sta cur_col
    sta cur_row
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

; can the current console sit at cur_col/cur_row?  A=0 yes, A=1 no
.proc fits_here
    ldy cur_type
    lda item_off, y
    sta pmask_lo
    lda item_ncells, y
    sta pmask_hi
    lda #0
    sta bitn
@l:
    lda pmask_lo
    clc
    adc bitn
    tax
    lda cell_dc, x
    clc
    adc cur_col
    sta cellc
    cmp #PW
    bcs @no
    lda cell_dr, x
    clc
    adc cur_row
    sta cellr
    cmp #PH
    bcs @no
    jsr field_index
    lda field, y
    bne @no
    inc bitn
    lda bitn
    cmp pmask_hi
    bne @l
    lda #0
    rts
@no:
    lda #1
    rts
.endproc

.proc place_here
    ldy cur_type
    lda item_off, y
    sta pmask_lo
    lda item_ncells, y
    sta pmask_hi
    lda #0
    sta bitn
@l:
    lda pmask_lo
    clc
    adc bitn
    tax
    lda cell_dc, x
    clc
    adc cur_col
    sta cellc
    lda cell_dr, x
    clc
    adc cur_row
    sta cellr
    jsr field_index
    lda cell_tile, x
    sta field, y
    inc bitn
    lda bitn
    cmp pmask_hi
    bne @l
    rts
.endproc

; --------------------------------------------------------------------------
.proc draw_pack_render
    lda #0
    sta oam_idx
    jsr draw_float
    jsr draw_next2
    jsr hide_rest_oam
    rts
.endproc

.proc draw_float
    lda pflash
    beq @draw
    lda frame
    and #2
    bne @draw
    rts                     ; blink while flashing "no fit"
@draw:
    ldy cur_type
    lda item_off, y
    sta pmask_lo
    lda item_ncells, y
    sta pmask_hi
    lda #0
    sta bitn
@l:
    lda pmask_lo
    clc
    adc bitn
    tax
    lda cell_dc, x
    clc
    adc cur_col
    clc
    adc #BIN_COL
    asl a
    asl a
    asl a
    sta tmp
    lda cell_dr, x
    clc
    adc cur_row
    clc
    adc #BIN_ROW
    asl a
    asl a
    asl a
    sta tmp2
    lda cell_tile, x
    sta tmp3
    lda #0
    sta tmp4
    jsr draw_spr8
    inc bitn
    lda bitn
    cmp pmask_hi
    bne @l
    rts
.endproc

.proc draw_next2
    ldy next_type
    lda item_off, y
    sta pmask_lo
    lda item_ncells, y
    sta pmask_hi
    lda #0
    sta bitn
@l:
    lda pmask_lo
    clc
    adc bitn
    tax
    lda cell_dc, x
    asl a
    asl a
    asl a
    clc
    adc #NEXT_PX
    sta tmp
    lda cell_dr, x
    asl a
    asl a
    asl a
    clc
    adc #NEXT_PY
    sta tmp2
    lda cell_tile, x
    sta tmp3
    lda #0
    sta tmp4
    jsr draw_spr8
    inc bitn
    lda bitn
    cmp pmask_hi
    bne @l
    rts
.endproc

; one 8x8 sprite: tmp=x, tmp2=y, tmp3=tile, tmp4=pal
.proc draw_spr8
    ldx oam_idx
    lda tmp2
    sta oam, x
    inx
    lda tmp3
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
;  Repaint the bin interior from the field (queued for vblank).
; --------------------------------------------------------------------------
.proc redraw_bin
    lda #0
    sta cellr
@rowl:
    lda cellr
    asl a
    asl a
    asl a
    sta tmp
    ldy #0
@celll:
    tya
    clc
    adc tmp
    tax
    lda field, x
    bne @put
    lda #$09
@put:
    sta rowbuf, y
    iny
    cpy #PW
    bne @celll
    lda cellr
    clc
    adc #BIN_ROW
    sta tmp
    and #7
    asl a
    asl a
    asl a
    asl a
    asl a
    clc
    adc #BIN_COL
    sta tmp4
    lda tmp
    lsr a
    lsr a
    lsr a
    clc
    adc #$20
    sta tmp3
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
    PUTS str_time,    NT + 21*32 + 5
    PUTS str_segas,   NT + 21*32 + 14
    PUTS str_next,    NT + 8*32 + 23
    PUTS str_ctrl1,   NT + 25*32 + 2
    PUTS str_ctrl2,   NT + 26*32 + 2
    rts
.endproc

; --------------------------------------------------------------------------
;  3-digit decimal of `packed` into cratebuf (used by the win screen).
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

; write A as 2 decimal digits at PPU addr in tmp3:tmp4 (rendering off)
.proc draw_num2
    jsr split_tens
    lda tmp3
    sta PPUADDR
    lda tmp4
    sta PPUADDR
    lda tmp
    clc
    adc #'0'
    sta PPUDATA
    lda tmp2
    clc
    adc #'0'
    sta PPUDATA
    rts
.endproc

; queue A as 2 decimal digits at PPU addr tmp3:tmp4 (vblank)
.proc queue_num2
    jsr split_tens
    lda tmp
    clc
    adc #'0'
    sta cratebuf+0
    lda tmp2
    clc
    adc #'0'
    sta cratebuf+1
    lda #<cratebuf
    sta ptr
    lda #>cratebuf
    sta ptr+1
    lda #2
    sta tmp2
    jsr vbuf_add
    rts
.endproc

; --------------------------------------------------------------------------
.proc commit_loadout
    lda packed
    sta weight
    jsr add_score           ; loot packed = points
    lda weight
    lsr a
    lsr a
    lsr a
    lsr a
    asl a
    sta move_delay
    jsr setup_level
    lda #ST_PLAY
    sta state
    rts
.endproc

.proc rand3
    jsr update_rng
    lda rng
    and #3
    cmp #3
    bne @ok
    lda #0
@ok:
    rts
.endproc

; ---- console piece data --------------------------------------------------
; type 0 = Game Gear (2x1, 2 cells)
; type 1 = Genesis + 2 controllers on wires (6x2 footprint, 8 cells)
;          C W G G W C
;          . . G G . .
; type 2 = Genesis + Sega CD (to the side) + 32X (5x3 footprint, 12 cells)
;          3 3 . . .
;          G G D D D
;          G G D D D
item_off:
    .byte 0, 2, 10
item_ncells:
    .byte 2, 8, 12
item_w:
    .byte 2, 6, 5
item_h:
    .byte 1, 2, 3
cell_dc:
    .byte 0,1
    .byte 0,1,2,3,4,5, 2,3
    .byte 0,1, 0,1,0,1, 2,3,4,2,3,4
cell_dr:
    .byte 0,0
    .byte 0,0,0,0,0,0, 1,1
    .byte 0,0, 1,1,2,2, 1,1,1,2,2,2
cell_tile:
    .byte $10,$11
    .byte $13,$14,$12,$12,$14,$13, $12,$12
    .byte $15,$15, $12,$12,$12,$12, $16,$16,$16,$16,$16,$16

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
    jsr reset_getaway_state
    lda #1
    sta mus_on
    lda #SONG_GETAWAY
    jsr music_play
    jsr ppu_on
    rts
.endproc

; --------------------------------------------------------------------------
;  Reset all getaway-world state (player, hazards, parallax, boss pools).
;  Shared by the real getaway stage and the title-screen demo overlay.
; --------------------------------------------------------------------------
.proc reset_getaway_state
    lda #170
    sta gy
    lda #0
    sta dist_lo
    sta dist_hi
    sta iframes
    sta regentmr
    sta combo
    sta combo_tmr
    ldx #0
:   sta pu_active, x
    inx
    cpx #N_PU
    bne :-
    lda #SH_MAX
    sta shield
    lda #2
    sta scroll_spd
    ldx difficulty
    lda spawn_per_diff, x
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
    ; scatter background treeline across the horizon
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
    asl a                   ; i*4
    clc
    adc #102
    sta cloud_y, x          ; on the grass treeline band
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
    rts
.endproc

; --------------------------------------------------------------------------
.proc do_getaway
    jsr getaway_input
    jsr combo_tick
    jsr move_parallax
    lda boss_on
    bne @boss
    ; ---- phase 1: dodge traffic until the chopper catches up ----
    jsr move_obstacles
    jsr spawn_tick
    jsr move_powerups
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
    lda #10                 ; points per distance tick
    jsr add_score
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

; y for a background treeline tree (on the grass band near the horizon)
.proc rand_sky_y
    jsr update_rng
    lda rng
    and #$0f
    clc
    adc #100
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
    sbc ob_spd, x           ; per-hazard speed (oncoming cars are faster)
    bcc @kill
    cmp #4
    bcc @kill
    sta ob_x, x             ; A = new x
    ; dodge combo: did this hazard just cross the warthog's pass line?
    cmp #PASSLINE+1
    bcs @next               ; still ahead of the warthog
    clc
    adc ob_spd, x           ; reconstruct old x = new + speed
    cmp #PASSLINE+1
    bcc @next               ; was already past -> not a new crossing
    jsr count_dodge
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

; a hazard slipped past -> grow the dodge combo, award combo*5 points
.proc count_dodge
    txa
    pha
    lda combo
    cmp #9
    bcs @capped
    inc combo
@capped:
    lda #90
    sta combo_tmr
    lda combo
    sta mtmp
    asl a
    asl a
    clc
    adc mtmp                ; combo * 5
    jsr add_score
    pla
    tax
    rts
.endproc

; decay the combo when the player goes too long without a dodge
.proc combo_tick
    lda combo_tmr
    beq @done
    dec combo_tmr
    bne @done
    lda #0
    sta combo
@done:
    rts
.endproc

; --------------------------------------------------------------------------
.proc spawn_tick
    dec spawn_tmr
    bne @ret
    lda spawn_per
    sta spawn_tmr
    jsr spawn_obstacle
    ; ~1 in 8 spawn ticks also drops a power-up
    jsr update_rng
    lda rng
    and #7
    bne @ret
    jsr spawn_powerup
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
    ; ~1 in 4 spawns is oncoming traffic: a faster car in an upper lane
    lda rng
    and #3
    bne @normal
    lda #4
    sta ob_type, x
    lda rng+1
    and #1
    asl a
    asl a
    asl a
    asl a                   ; 0 or 16
    clc
    adc #GY_MIN
    sta ob_y, x
    lda scroll_spd
    clc
    adc #3
    sta ob_spd, x
    rts
@normal:
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
    lda scroll_spd
    sta ob_spd, x
    rts
.endproc

; --------------------------------------------------------------------------
;  Power-ups: poutine (shield), extra life, maple star (invincibility).
; --------------------------------------------------------------------------
pu_tile:
    .byte $74, $78, $7c

.proc spawn_powerup
    ldx #0
@f:
    lda pu_active, x
    beq @found
    inx
    cpx #N_PU
    bne @f
    rts                     ; no free slot
@found:
    lda #1
    sta pu_active, x
    lda #248
    sta pu_x, x
    jsr update_rng
    lda rng+1
    and #$1f
    clc
    adc #150                ; somewhere on the road band
    sta pu_y, x
    jsr update_rng
    lda rng
    and #3
    cmp #3
    bne @notlife
    lda #1                  ; extra life (~1 in 4 power-ups)
    jmp @sett
@notlife:
    cmp #2
    bne @poutine
    lda #2                  ; maple star
    jmp @sett
@poutine:
    lda #0                  ; poutine
@sett:
    sta pu_type, x
    rts
.endproc

.proc move_powerups
    lda scroll_spd
    clc
    adc #1
    sta mtmp                ; power-up drift speed
    ldx #0
@l:
    lda pu_active, x
    beq @next
    lda pu_x, x
    sec
    sbc mtmp
    bcc @kill
    cmp #4
    bcc @kill
    sta pu_x, x
    ; pickup test vs the warthog
    sec
    sbc #WART_X
    bpl @dxp
    eor #$ff
    clc
    adc #1
@dxp:
    cmp #16
    bcs @next
    lda pu_y, x
    sec
    sbc gy
    bpl @dyp
    eor #$ff
    clc
    adc #1
@dyp:
    cmp #16
    bcs @next
    ; collected
    lda #0
    sta pu_active, x
    lda pu_type, x
    jsr apply_powerup
    jmp @next
@kill:
    lda #0
    sta pu_active, x
@next:
    inx
    cpx #N_PU
    bne @l
    rts
.endproc

; apply the collected power-up (A = type), preserving X
.proc apply_powerup
    sta mtmp
    txa
    pha
    lda mtmp
    cmp #1
    beq @life
    cmp #2
    beq @star
    ; type 0 poutine -> refill the shield
    lda #SH_MAX
    sta shield
    jmp @reward
@life:
    lda lives
    cmp #9
    bcs @reward
    inc lives
    jmp @reward
@star:
    lda #180                ; ~3s of maple-star invincibility
    sta iframes
@reward:
    lda #50
    jsr add_score
    lda #SFX_CROSS
    jsr sfx_p
    lda #1
    sta hud_dirty
    pla
    tax
    rts
.endproc

.proc draw_powerups
    lda #0
    sta obloop
@l:
    ldx obloop
    lda pu_active, x
    beq @n
    lda pu_x, x
    sta tmp
    lda pu_y, x
    sta tmp2
    ldy pu_type, x
    lda pu_tile, y
    sta tmp3
    lda #1
    sta tmp4
    jsr draw_meta16
@n:
    inc obloop
    lda obloop
    cmp #N_PU
    bne @l
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
    sbc #(WART_X+14)        ; centre of the wider warthog
    bpl @dxp
    eor #$ff
    clc
    adc #1
@dxp:
    cmp #16
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
    sta combo               ; a hit breaks the dodge combo
    sta combo_tmr
    lda shield
    beq @lose
    dec shield
    jsr fx_hit
    lda #IFRAMES
    sta iframes
    lda #SFX_SHIELD
    jsr sfx_p
    rts
@lose:
    jsr fx_big
    dec lives
    lda lives
    beq @over
    lda #SH_MAX
    sta shield
    lda #IFRAMES
    sta iframes
    lda #SFXN_DEATH
    jsr sfx_n
    rts
@over:
    lda #SFXN_DEATH
    jsr sfx_n
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
    lda #SONG_BOSS
    jsr music_play
    lda #1
    sta boss_on
    ldx difficulty
    lda boss_hp_diff, x
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
    lda #0
    sta boss_pat            ; start in sweep pattern
    sta boss_flash
    sta boss_rage
    lda #200
    sta boss_pat_t
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
    lda boss_flash
    beq @noflash
    dec boss_flash
@noflash:
    ; switch attack pattern periodically
    dec boss_pat_t
    bne @nosw
    lda boss_pat
    eor #1
    sta boss_pat
    beq @sw0
    lda #120
    jmp @swset
@sw0:
    lda #200
@swset:
    sta boss_pat_t
@nosw:
    lda boss_pat
    bne @dive
    ; --- pattern 0: vertical sweep, single bombs ---
    lda boss_dir
    beq @down
    dec boss_y
    lda boss_y
    cmp #64
    bne @swatk
    lda #0
    sta boss_dir
    jmp @swatk
@down:
    inc boss_y
    lda boss_y
    cmp #148
    bne @swatk
    lda #1
    sta boss_dir
@swatk:
    dec boss_atk
    bne @after
    lda #40
    ldx boss_rage
    beq :+
    lda #18                 ; berserk: bomb far more often
:   sta boss_atk
    jsr drop_bomb
    jmp @after
@dive:
    ; --- pattern 1: dive at the warthog, bomb faster ---
    lda boss_y
    cmp gy
    beq @dvatk
    bcs @ddec
    inc boss_y
    jmp @dvatk
@ddec:
    dec boss_y
@dvatk:
    dec boss_atk
    bne @after
    lda #22
    ldx boss_rage
    beq :+
    lda #12                 ; berserk: rapid dive-bombing
:   sta boss_atk
    jsr drop_bomb
@after:
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
    ; chopper downed -> duty-free bonus round, then Canada
    lda #200                ; boss-kill bonus
    jsr add_score
    jsr fx_big
    lda #SFXN_BOOM
    jsr sfx_n
    lda #ST_BONUS
    sta state
    jsr enter_bonus
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
    lda #SFX_SHOOT
    jsr sfx_p
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
    lda #6
    sta boss_flash          ; blink the chopper on the hit
    lda #20                 ; points per boss hit
    jsr add_score
    lda #SFX_BOSSHIT
    jsr sfx_p
    ; enter berserk phase once the chopper is badly damaged
    lda boss_rage
    bne @next
    lda boss_hp
    cmp #3
    bcs @next
    lda #1
    sta boss_rage
    jsr fx_hit              ; jolt + flash telegraphs the rage
    lda #SFXN_HIT
    jsr sfx_n
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
    sbc #(WART_X+14)        ; centre of the wider warthog
    bpl @dxp
    eor #$ff
    clc
    adc #1
@dxp:
    cmp #14
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
    lda #':'
    sta hudline+1
    lda lives
    clc
    adc #'0'
    sta hudline+2
    lda #'S'
    sta hudline+4
    lda #'H'
    sta hudline+5
    lda #':'
    sta hudline+6
    ldx #0
@pl:
    cpx shield
    bcs @pe
    lda #$07
    jmp @pp
@pe:
    lda #' '
@pp:
    sta hudline+7, x
    inx
    cpx #3
    bne @pl
    lda boss_on
    bne @boss
    ; distance meter (4-cell bar)
    lda #'D'
    sta hudline+11
    lda #':'
    sta hudline+12
    lda dist_hi
    lsr a
    lsr a
    sta tmp                 ; filled = dist_hi/4 (0..4)
    jmp @bar
@boss:
    ; chopper HP meter
    lda #'H'
    sta hudline+11
    lda #':'
    sta hudline+12
    lda boss_hp
    lsr a
    sta tmp                 ; filled = boss_hp/2 (0..4)
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
    sta hudline+13, x
    inx
    cpx #4
    bne @bl
    ; score
    lda #'S'
    sta hudline+18
    lda #'C'
    sta hudline+19
    lda #':'
    sta hudline+20
    jsr score_digits
    ldx #0
@sc:
    lda scorebuf, x
    sta hudline+21, x
    inx
    cpx #5
    bne @sc
    ; dodge combo multiplier (shown once it builds up)
    lda combo
    cmp #2
    bcc @nocombo
    lda #'X'
    sta hudline+27
    lda combo
    clc
    adc #'0'
    sta hudline+28
@nocombo:
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
    lda #WART_X             ; left half
    sta tmp
    lda gy
    sta tmp2
    lda #$50
    sta tmp3
    lda #2
    sta tmp4
    jsr draw_meta16
    lda #WART_X+16          ; right half
    sta tmp
    lda gy
    sta tmp2
    lda #$54
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
    jsr draw_powerups
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
    ; blink the chopper for a few frames after a hit
    lda boss_flash
    beq @show
    lda frame
    and #1
    beq @show
    jmp @proj                ; skip the body this frame
@show:
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
@proj:
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
; background parallax treeline (drifts slowly along the horizon)
.proc draw_clouds
    lda #0
    sta obloop
@l:
    ldx obloop
    lda cloud_x, x
    sta tmp
    lda cloud_y, x
    sta tmp2
    lda #$40                ; pine tree metasprite
    sta tmp3
    lda #0                  ; tan/green tree palette
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
    ; attribute table: each gw_attr byte fills a row of 8 (P0 sky, P2 grass,
    ; P1 road)
    ldx #0
@arow:
    lda gw_attr, x
    ldy #8
@acol:
    sta PPUDATA
    dey
    bne @acol
    inx
    cpx #8
    bne @arow
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
;  Score
; ===========================================================================
; add A (0-255) to the 16-bit score
.proc add_score
    clc
    adc score_lo
    sta score_lo
    bcc @done
    inc score_hi
@done:
    rts
.endproc

; if score > high score, replace it (and persist the new high to WRAM)
.proc update_hiscore
    lda score_hi
    cmp hisc_hi
    bcc @done
    bne @set
    lda score_lo
    cmp hisc_lo
    bcc @done
@set:
    lda score_lo
    sta hisc_lo
    sta sram_hi_lo
    lda score_hi
    sta hisc_hi
    sta sram_hi_hi
@done:
    rts
.endproc

; ---- battery save: validate signature, load high score / difficulty -------
.proc load_save
    lda sram_sig+0
    cmp #'B'
    bne @init
    lda sram_sig+1
    cmp #'R'
    bne @init
    lda sram_sig+2
    cmp #'U'
    bne @init
    lda sram_sig+3
    cmp #'N'
    bne @init
    ; valid save present -> restore high score + difficulty
    lda sram_hi_lo
    sta hisc_lo
    lda sram_hi_hi
    sta hisc_hi
    lda sram_diff
    cmp #3
    bcc :+
    lda #1                  ; guard against garbage difficulty
:   sta difficulty
    rts
@init:
    lda #'B'
    sta sram_sig+0
    lda #'R'
    sta sram_sig+1
    lda #'U'
    sta sram_sig+2
    lda #'N'
    sta sram_sig+3
    lda #0
    sta sram_hi_lo
    sta sram_hi_hi
    sta hisc_lo
    sta hisc_hi
    lda #1                  ; default difficulty = normal
    sta sram_diff
    sta difficulty
    rts
.endproc

; ---- impact feedback: kick the screen-shake + hit-flash timers ------------
.proc fx_hit                ; small jolt (shield absorb, single hit)
    lda #5
    sta shake_tmr
    lda #2
    sta flash_tmr
    rts
.endproc

.proc fx_big                ; heavy jolt (life lost, boss destroyed)
    lda #14
    sta shake_tmr
    lda #5
    sta flash_tmr
    rts
.endproc

; render the 16-bit score into scorebuf as 5 decimal digits
.proc score_digits
    lda score_lo
    sta tmp
    lda score_hi
    sta tmp2
    ldy #0
@dloop:
    ldx #0
@sub:
    lda tmp
    sec
    sbc div_lo, y
    sta tmp3
    lda tmp2
    sbc div_hi, y
    bcc @subdone
    sta tmp2
    lda tmp3
    sta tmp
    inx
    jmp @sub
@subdone:
    txa
    clc
    adc #'0'
    sta scorebuf, y
    iny
    cpy #4
    bne @dloop
    lda tmp
    clc
    adc #'0'
    sta scorebuf+4
    rts
.endproc

div_lo: .byte <10000, <1000, <100, <10
div_hi: .byte >10000, >1000, >100, >10

; convert the high score into scorebuf (for screen display)
.proc hiscore_digits
    lda score_lo
    pha
    lda score_hi
    pha
    lda hisc_lo
    sta score_lo
    lda hisc_hi
    sta score_hi
    jsr score_digits
    pla
    sta score_hi
    pla
    sta score_lo
    rts
.endproc

; write scorebuf (5 digits) to PPUDATA (PPUADDR must be latched)
.proc put_scorebuf
    lda scorebuf+0
    sta PPUDATA
    lda scorebuf+1
    sta PPUDATA
    lda scorebuf+2
    sta PPUDATA
    lda scorebuf+3
    sta PPUDATA
    lda scorebuf+4
    sta PPUDATA
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
;  Emit a 32x32 sprite (four 16x16 metasprites) into shadow OAM.
;   tmp = x, tmp2 = y, tmp3 = base tile, tmp4 = palette
; --------------------------------------------------------------------------
.proc draw_meta32
    jsr draw_meta16         ; TL
    lda tmp
    clc
    adc #16
    sta tmp
    lda tmp3
    clc
    adc #4
    sta tmp3
    jsr draw_meta16         ; TR
    lda tmp
    sec
    sbc #16
    sta tmp
    lda tmp2
    clc
    adc #16
    sta tmp2
    lda tmp3
    clc
    adc #4
    sta tmp3
    jsr draw_meta16         ; BL
    lda tmp
    clc
    adc #16
    sta tmp
    lda tmp3
    clc
    adc #4
    sta tmp3
    jsr draw_meta16         ; BR
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
    ; L:n  LV:n  SH:###  SC:nnnnn
    lda #'L'
    sta hudline+0
    lda #':'
    sta hudline+1
    lda lives
    clc
    adc #'0'
    sta hudline+2
    lda #'L'
    sta hudline+4
    lda #'V'
    sta hudline+5
    lda #':'
    sta hudline+6
    lda level
    clc
    adc #'0'
    sta hudline+7
    lda #'S'
    sta hudline+9
    lda #'H'
    sta hudline+10
    lda #':'
    sta hudline+11
    ldx #0
@pl:
    cpx shield
    bcs @empty
    lda #$07
    jmp @put
@empty:
    lda #' '
@put:
    sta hudline+12, x
    inx
    cpx #3
    bne @pl
    lda #'S'
    sta hudline+16
    lda #'C'
    sta hudline+17
    lda #':'
    sta hudline+18
    jsr score_digits
    ldx #0
@sc:
    lda scorebuf, x
    sta hudline+19, x
    inx
    cpx #5
    bne @sc

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

; crossing palette themed by level: 1 day, 2 dusk, 3+ night
.proc load_pal_level
    lda #<palette
    ldx #>palette
    ldy level
    cpy #2
    bcc @go                 ; level 1 -> day
    bne @night              ; level >2 -> night
    lda #<palette_dusk      ; level 2 -> dusk
    ldx #>palette_dusk
    jmp @go
@night:
    lda #<palette_night
    ldx #>palette_night
@go:
    sta ptr
    stx ptr+1
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
    jsr sfx_update
    lda mus_on
    bne :+
    rts
:   jsr noise_decay
    inc mus_tick
    lda mus_tick
    cmp song_tempo
    bcc done
    lda #0
    sta mus_tick
    inc mus_step
    lda mus_step
    cmp song_len
    bcc :+
    lda #0
    sta mus_step
:   jsr play_row
done:
    rts
.endproc

; switch the active song; A = song id (SONG_*)
.proc music_play
    sta mtmp
    asl a
    asl a
    asl a                   ; id * 8
    clc
    adc mtmp
    adc mtmp                ; + id*2 = id*10
    tax
    lda songtab+0, x
    sta song_mel_p
    lda songtab+1, x
    sta song_mel_p+1
    lda songtab+2, x
    sta song_harm_p
    lda songtab+3, x
    sta song_harm_p+1
    lda songtab+4, x
    sta song_bass_p
    lda songtab+5, x
    sta song_bass_p+1
    lda songtab+6, x
    sta song_perc_p
    lda songtab+7, x
    sta song_perc_p+1
    lda songtab+8, x
    sta song_len
    lda songtab+9, x
    sta song_tempo
    lda #0
    sta mus_step
    sta mus_tick
    sta $4008               ; drop any held triangle note
    rts
.endproc

.proc play_row
    ldy mus_step
    lda (song_mel_p), y
    jsr set_pulse1
    ldy mus_step
    lda (song_harm_p), y
    jsr set_pulse2
    ldy mus_step
    lda (song_bass_p), y
    jsr set_tri
    ldy mus_step
    lda (song_perc_p), y
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
    ldx sfxp_dur            ; an SFX owns pulse2 -- leave it alone
    bne @ret
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
    ldx sfxn_dur            ; an SFX owns the noise channel
    bne @skip
    cmp #0
    bne @go
@skip:
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
    lda sfxn_dur            ; SFX owns the noise channel
    bne @done
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
;  Sound effects: a tonal slot on pulse2 and a burst slot on the noise
;  channel.  Both play over the music, which resumes when they finish.
; ===========================================================================
.proc sfx_update
    ; ---- pulse2 tonal slot ----
    lda sfxp_dur
    beq @noise
    lda #%10110000          ; duty2, const vol
    ora sfxp_vol
    sta $4004
    lda sfxp_perlo
    sta $4006
    lda sfxp_perhi
    ora #$08
    sta $4007
    ; period += signed step
    ldy #0
    lda sfxp_step
    bpl :+
    ldy #$ff
:   clc
    adc sfxp_perlo
    sta sfxp_perlo
    tya
    adc sfxp_perhi
    sta sfxp_perhi
    ; volume decay
    lda sfxp_vol
    sec
    sbc sfxp_dec
    bcs :+
    lda #0
:   sta sfxp_vol
    dec sfxp_dur
    bne @noise
    lda #%00110000          ; done: silence pulse2
    sta $4004
@noise:
    ; ---- noise burst slot ----
    lda sfxn_dur
    beq @done
    lda #%00110000
    ora sfxn_vol
    sta $400c
    lda sfxn_per
    sta $400e
    lda #$08
    sta $400f
    lda sfxn_per
    clc
    adc sfxn_step
    and #$0f
    sta sfxn_per
    lda sfxn_vol
    sec
    sbc sfxn_dec
    bcs :+
    lda #0
:   sta sfxn_vol
    dec sfxn_dur
    bne @done
    lda #%00110000          ; done: silence noise
    sta $400c
@done:
    rts
.endproc

; trigger a pulse2 SFX; A = id
.proc sfx_p
    sta sfxtmp
    asl a
    clc
    adc sfxtmp
    asl a                   ; id * 6
    tax
    lda sfxp_tab+0, x
    sta sfxp_perlo
    lda sfxp_tab+1, x
    sta sfxp_perhi
    lda sfxp_tab+2, x
    sta sfxp_step
    lda sfxp_tab+3, x
    sta sfxp_vol
    lda sfxp_tab+4, x
    sta sfxp_dec
    lda sfxp_tab+5, x
    sta sfxp_dur
    rts
.endproc

; trigger a noise SFX; A = id
.proc sfx_n
    sta sfxtmp
    asl a
    asl a
    clc
    adc sfxtmp              ; id * 5
    tax
    lda sfxn_tab+0, x
    sta sfxn_per
    lda sfxn_tab+1, x
    sta sfxn_step
    lda sfxn_tab+2, x
    sta sfxn_vol
    lda sfxn_tab+3, x
    sta sfxn_dec
    lda sfxn_tab+4, x
    sta sfxn_dur
    rts
.endproc

; ===========================================================================
;  Data
; ===========================================================================
.segment "RODATA"

.include "music.inc"

; pulse2 SFX: perlo, perhi, step(signed), vol, dec, dur
sfxp_tab:
    .byte $fe,$00,  0, 6,2, 4    ; HOP    -- short high blip
    .byte $20,$01,  8, 9,1,12    ; PLACE  -- descending thunk
    .byte $90,$00, 14, 8,1, 8    ; SHOOT  -- laser zap
    .byte $60,$01,$f4, 9,0,14    ; CROSS  -- rising chime
    .byte $20,$01,$f8, 9,1,10    ; START  -- rising blip
    .byte $a0,$00,  6, 8,1, 8    ; SHIELD -- warble
    .byte $00,$02,  0, 8,1,10    ; ERROR  -- low buzz
    .byte $c0,$00,  4, 7,2, 5    ; BOSSHIT-- mid tick
    .byte $60,$01,  0,10,0,18    ; HONK   -- steady car horn

; noise SFX: per, step, vol, dec, dur
sfxn_tab:
    .byte  6,0,10,2, 8           ; HIT   -- quick burst
    .byte  3,1,15,1,24           ; BOOM  -- big explosion
    .byte  8,1,12,1,16           ; DEATH -- crash burst

palette:
    ; LEVEL 1 -- daytime highway (black, asphalt, white, yellow)
    .byte $0f,$00,$30,$28
    .byte $0f,$00,$30,$28
    .byte $0f,$00,$30,$28
    .byte $0f,$00,$30,$28
    ; sprite palettes (shared by all crossings)
    .byte $0f,$27,$12,$16   ; 0 player: skin, shirt, console
    .byte $0f,$0f,$30,$16   ; 1 red car/van: tire, window, red body
    .byte $0f,$0f,$2a,$30   ; 2 patrol rig/warthog: tire, green, white
    .byte $0f,$17,$16,$30   ; 3 moose/console: brown, red, white

palette_dusk:
    ; LEVEL 2 -- sunset crossing (maroon asphalt, warm lines)
    .byte $0f,$06,$30,$27
    .byte $0f,$06,$30,$27
    .byte $0f,$06,$30,$27
    .byte $0f,$06,$30,$27
    .byte $0f,$27,$12,$16
    .byte $0f,$0f,$30,$16
    .byte $0f,$0f,$2a,$30
    .byte $0f,$17,$16,$30

palette_night:
    ; LEVEL 3 -- night run (deep-blue asphalt, cool lines)
    .byte $0f,$01,$3d,$21
    .byte $0f,$01,$3d,$21
    .byte $0f,$01,$3d,$21
    .byte $0f,$01,$3d,$21
    .byte $0f,$27,$12,$16
    .byte $0f,$0f,$30,$16
    .byte $0f,$0f,$2a,$30
    .byte $0f,$17,$16,$30

palette_pack:
    ; background: black, grey(empty cell), red(crate fill), white(wall/text)
    .byte $0f,$07,$16,$30
    .byte $0f,$07,$16,$30
    .byte $0f,$07,$16,$30
    .byte $0f,$07,$16,$30
    ; sprite palette 0 matches the console art (grey body, red trim, white)
    .byte $0f,$07,$16,$30
    .byte $0f,$0f,$30,$16
    .byte $0f,$0f,$2a,$30
    .byte $0f,$17,$16,$30

palette_getaway:
    ; per-region background palettes (assigned by the attribute table):
    ; P0 sky/HUD, P1 road, P2 grass/treeline, P3 spare
    .byte $0f,$21,$30,$30   ; P0: black, sky-blue, white, white
    .byte $0f,$00,$30,$28   ; P1: black, asphalt grey, white line, yellow
    .byte $0f,$1a,$2a,$30   ; P2: black, green, lt-green, white
    .byte $0f,$00,$30,$28   ; P3: = road
    ; sprite palettes: 0 tan/green (tree,deer -- tan stands out on brown),
    ; 1 red/yellow (fish,dish), 2 warthog green, 3 spare brown/red
    .byte $0f,$27,$2a,$30
    .byte $0f,$16,$28,$30
    .byte $0f,$0f,$2a,$30
    .byte $0f,$17,$16,$30

; getaway hazard metasprite base + palette, indexed by ob_type
obtile:
    .byte $40, $44, $48, $4c, $68   ; tree, fish, deer, hot dish, oncoming car
obpal:
    .byte 0, 1, 0, 1, 1

; getaway scene: nametable fill tile per row (30 rows)
gw_row_tile:
    .byte $00,$00                            ; rows 0-1  black HUD bar (P0)
    .byte $0e,$0e,$0e,$0e,$0e,$0e,$0e,$0e,$0e,$0e  ; rows 2-11 sky (P0)
    .byte $0f,$0f,$0f,$0f                    ; rows 12-15 grass treeline (P2)
    .byte $0c                                ; row 16 road top edge (P1)
    .byte $0b,$0d,$0b,$0b,$0d,$0b            ; rows 17-22 road + lane dashes
    .byte $0b,$0d,$0b,$0b,$0d,$0b,$0b        ; rows 23-29 road

; getaway attribute rows (each byte covers 4 tile rows): sky, grass, road
gw_attr:
    .byte $00,$00,$00,$aa,$55,$55,$55,$55

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

txt_paused:   .byte "PAUSED", 0
txt_pauseres: .byte "SELECT TO RESUME", 0

txt_intro0:
    TEXT 4,  9, "THE SITUATION"
    TEXT 8,  5, "CANADA HAS BANNED THE"
    TEXT 10, 6, "SEGA GENESIS. AGAIN."
    TEXT 13, 6, "COLLECTORS UP NORTH"
    TEXT 15, 4, "PAY BIG IN MAPLE GOLD"
    TEXT 25, 8, "START- MORE"
    .byte 0

txt_intro1:
    TEXT 4, 11, "THE PLAN"
    TEXT 8,  6, "SCANNERS SEE EVERY"
    TEXT 10, 4, "CRATE... BUT NOT THE"
    TEXT 12, 5, "ONE PLACE ON EARTH-"
    TEXT 14, 10, "YOUR COLON"
    TEXT 17, 4, "PACK IT. RUN IT. EH."
    TEXT 25, 7, "START- GO SMUGGLE"
    .byte 0

txt_bonus:
    TEXT 1, 10, "BONUS ROUND"
    TEXT 2,  9, "DUTY FREE DASH"
    TEXT 3, 14, "TIME"
    .byte 0

; title banner overlaid on the live getaway demo (black rows 0-5)
txt_overlay:
    TEXT 1, 11, "BORDER RUN"
    TEXT 3, 10, "PRESS START"
    TEXT 4,  9, "SPEED"
    TEXT 5, 11, "HI"
    .byte 0

diff_easy: .byte "EASY  "
diff_norm: .byte "NORMAL"
diff_hard: .byte "HARD  "

; per-difficulty tuning tables (indexed by difficulty 0=easy,1=normal,2=hard)
spawn_per_diff: .byte 52, 40, 30      ; getaway traffic gap (smaller = denser)
boss_hp_diff:   .byte 6, 8, 11        ; chopper hit points
pack_secs_diff: .byte 40, 30, 22      ; packing countdown seconds

txt_level:
    TEXT 8,  9, "BORDER CROSSED"
    TEXT 10, 13, "LEVEL"
    .byte 0

txt_over:
    TEXT 8,  6, "BUSTED AT THE BORDER"
    TEXT 11, 11, "GAME OVER"
    TEXT 15, 9, "SCORE"
    TEXT 17, 9, "HI"
    TEXT 22, 10, "PRESS START"
    .byte 0

txt_win:
    TEXT 3,  7, "WELCOME TO CANADA"
    TEXT 5,  11, "YOU MADE IT"
    TEXT 7,  6, "GENESIS DELIVERED EH"
    TEXT 9,  9, "CRATES PACKED"
    TEXT 11, 9, "SCORE"
    TEXT 13, 9, "HI"
    TEXT 26, 10, "PRESS START"
    .byte 0

; packing-stage strings (nul terminated for puts)
str_packhdr:  .byte "PACK YOUR COLON", 0
str_packsub:  .byte "CRAM IN THE SEGA GEAR", 0
str_next:     .byte "NEXT", 0
str_time:     .byte "TIME:", 0
str_segas:    .byte "SEGAS:", 0
str_ctrl1:    .byte "DPAD MOVE   A DROP", 0
str_ctrl2:    .byte "B SKIP   START DONE", 0

.include "pieces.inc"

; ===========================================================================
.segment "CHARS"
    .incbin "chr.bin"

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq
