import type { Board, GameState, Owner, PieceType } from './types'

export interface OpeningResult {
  name: string
  kanji: string
}

// ─── Board helpers ───────────────────────────────────────────────

function findPiece(board: Board, owner: Owner, type: PieceType): { r: number; c: number } | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r][c]
      // match unpromotd piece only (promoted rook = DragonKing, still 'R' type but p=true)
      if (cell?.o === owner && cell.t === type && !cell.p) return { r, c }
    }
  }
  return null
}

// Starting squares
const L_ROOK_HOME = { r: 7, c: 7 }  // light: row 7, col H
const D_ROOK_HOME = { r: 1, c: 1 }  // dark:  row 1, col B
const L_KING_HOME = { r: 8, c: 4 }  // light: row 8, col E (center)
const D_KING_HOME = { r: 0, c: 4 }  // dark:  row 0, col E (center)

function hasMoved(pos: { r: number; c: number }, home: { r: number; c: number }): boolean {
  return !(pos.r === home.r && pos.c === home.c)
}

// ─── Rook classification ─────────────────────────────────────────
//
// Board columns A-I (0-8). Shogi file numbers (sente/light view): 9→1 left to right.
// file = 9 - col  (for light's perspective)
// Gote's (dark's) file: col + 1 (mirrored)
//
// Light rook starts at col 7 (file 2). Common ranging positions:
//   col 6 (G) = file 3 → 三間飛車 Three-File Rook
//   col 5 (F) = file 4 → 四間飛車 Four-File Rook  ← most popular
//   col 4 (E) = file 5 → 中飛車   Central Rook
//   col 1 (B) = file 8 → 向かい飛車 Opposition Rook (faces dark's starting rook)
//
// Dark rook starts at col 1 (gote's file 2). Common ranging positions (gote file = col+1):
//   col 2 (C) = gote file 3 → Three-File Rook (from dark's view)
//   col 3 (D) = gote file 4 → Four-File Rook  (from dark's view)
//   col 4 (E) = gote file 5 → Central Rook    (same center)
//   col 7 (H) = gote file 8 → Opposition Rook (faces light's starting rook)

type RookStyle = 'static' | '3file' | '4file' | 'central' | 'facing' | 'ranging'

function lightRookStyle(col: number): RookStyle {
  switch (col) {
    case 7: return 'static'
    case 6: return '3file'
    case 5: return '4file'
    case 4: return 'central'
    case 1: return 'facing'
    default: return 'ranging'
  }
}

function darkRookStyle(col: number): RookStyle {
  switch (col) {
    case 1: return 'static'
    case 2: return '3file'
    case 3: return '4file'
    case 4: return 'central'
    case 7: return 'facing'
    default: return 'ranging'
  }
}

function isRanging(s: RookStyle): boolean {
  return s !== 'static'
}

const ROOK_LABEL: Record<RookStyle, [name: string, kanji: string]> = {
  static:  ['Static Rook',       '居飛車'],
  '3file': ['Third-File Rook',   '三間飛車'],
  '4file': ['Four-File Rook',    '四間飛車'],
  central: ['Central Rook',      '中飛車'],
  facing:  ['Opposition Rook',   '向かい飛車'],
  ranging: ['Ranging Rook',      '振り飛車'],
}

// ─── Castle classification ────────────────────────────────────────
//
// Ranging-rook player casts to the SAME side the rook left from (right for light, left for dark).
// Static-rook player castles to the OPPOSITE side (left for light, right for dark).
//
// Light ranging rook → king goes RIGHT (col 6-8):
//   col 8 (I) = Anaguma (穴熊)   — king in far-right corner
//   col 6-7   = Mino   (美濃囲い) — king near right side
//
// Light static rook → king goes LEFT (col 0-3):
//   col 0 (A) = Anaguma (穴熊)   — king in far-left corner
//   col 1-3   = Yagura  (矢倉)   — classic left-side castle
//
// Dark ranging rook → king goes LEFT (col 0-2):
//   col 0 (A) = Anaguma — far-left corner
//   col 1-2   = Mino    — left side
//
// Dark static rook → king goes RIGHT (col 5-8):
//   col 8 (I) = Anaguma
//   col 5-7   = Yagura

type CastleType = 'mino' | 'anaguma' | 'yagura'

function lightCastle(kingCol: number, rStyle: RookStyle): CastleType | null {
  if (isRanging(rStyle)) {
    if (kingCol === 8) return 'anaguma'
    if (kingCol >= 6) return 'mino'
  } else {
    if (kingCol === 0) return 'anaguma'
    if (kingCol <= 3) return 'yagura'
  }
  return null
}

function darkCastle(kingCol: number, rStyle: RookStyle): CastleType | null {
  if (isRanging(rStyle)) {
    if (kingCol === 0) return 'anaguma'
    if (kingCol <= 2) return 'mino'
  } else {
    if (kingCol === 8) return 'anaguma'
    if (kingCol >= 5) return 'yagura'
  }
  return null
}

const CASTLE_LABEL: Record<CastleType, [name: string, kanji: string]> = {
  mino:    ['Mino Castle', '美濃囲い'],
  anaguma: ['Anaguma',     '穴熊'],
  yagura:  ['Yagura',      '矢倉'],
}

// ─── Main detector ───────────────────────────────────────────────

export function detectOpening(state: GameState, moveCount: number): OpeningResult | null {
  // Too few moves to classify
  if (moveCount < 4) return null

  const lRook = findPiece(state.board, 'l', 'R')
  const dRook = findPiece(state.board, 'd', 'R')
  const lKing = findPiece(state.board, 'l', 'K')
  const dKing = findPiece(state.board, 'd', 'K')

  const lRookMoved = lRook ? hasMoved(lRook, L_ROOK_HOME) : false
  const dRookMoved = dRook ? hasMoved(dRook, D_ROOK_HOME) : false
  const lKingMoved = lKing ? hasMoved(lKing, L_KING_HOME) : false
  const dKingMoved = dKing ? hasMoved(dKing, D_KING_HOME) : false

  // Wait until at least one piece has meaningfully moved
  if (!lRookMoved && !dRookMoved && !lKingMoved && !dKingMoved) return null

  // Determine rook styles. A rook that hasn't moved can be:
  //   - Confirming "static" if 12+ moves elapsed (likely a deliberate choice)
  //   - Or still undecided → only emit style if the rook actually moved
  const lStyle: RookStyle | null = lRookMoved
    ? (lRook ? lightRookStyle(lRook.c) : null)
    : (moveCount >= 12 && lRook ? 'static' : null)

  const dStyle: RookStyle | null = dRookMoved
    ? (dRook ? darkRookStyle(dRook.c) : null)
    : (moveCount >= 12 && dRook ? 'static' : null)

  // Castle data
  const lCastle = lKing && lStyle ? lightCastle(lKing.c, lStyle) : null
  const dCastle = dKing && dStyle ? darkCastle(dKing.c, dStyle) : null

  // ── Named special cases ──────────────────────────────────────

  // Double Static Rook — check for Yagura (most common named sub-opening)
  if (lStyle === 'static' && dStyle === 'static') {
    if (lCastle === 'yagura' || dCastle === 'yagura') {
      return { name: 'Yagura', kanji: '矢倉' }
    }
    if (lCastle === 'anaguma' || dCastle === 'anaguma') {
      return { name: 'Anaguma (Static)', kanji: '居飛車穴熊' }
    }
    return { name: 'Double Static Rook', kanji: '相居飛車' }
  }

  // Double Ranging Rook
  if (lStyle && isRanging(lStyle) && dStyle && isRanging(dStyle)) {
    return { name: 'Double Ranging Rook', kanji: '相振り飛車' }
  }

  // ── Single-side classification ───────────────────────────────

  // Light is ranging, dark is static (or unknown)
  if (lStyle && isRanging(lStyle)) {
    const [rn, rk] = ROOK_LABEL[lStyle]
    if (lCastle) {
      const [cn, ck] = CASTLE_LABEL[lCastle]
      return { name: `${rn} + ${cn}`, kanji: `${rk} / ${ck}` }
    }
    return { name: rn, kanji: rk }
  }

  // Dark is ranging, light is static
  if (dStyle && isRanging(dStyle)) {
    const [rn, rk] = ROOK_LABEL[dStyle]
    // Light's castle (defending against ranging rook attack)
    if (lCastle) {
      const [cn, ck] = CASTLE_LABEL[lCastle]
      return { name: `vs. ${rn} (${cn})`, kanji: `対${rk} / ${ck}` }
    }
    return { name: `vs. ${rn}`, kanji: `対${rk}` }
  }

  // Only king has moved so far
  if (lKingMoved && lKing) {
    const c = lightCastle(lKing.c, 'static')
    if (c) {
      const [cn, ck] = CASTLE_LABEL[c]
      return { name: cn, kanji: ck }
    }
  }

  return null
}
