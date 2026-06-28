import type { Drop, GameState, HandType, Move, Owner } from '../lib/types'
import {
  apply, canPromote, gameStatus, HAND_TYPES,
  legalDrops, legalTargetsFrom, mustPromote, opp,
} from '../lib/engine'

const MATE = 100_000

const BASE: Record<string, number> = { P:1, L:3, N:4, S:5, G:6, B:8, R:10, K:0 }
const PROMO: Record<string, number> = { P:7, L:6, N:6, S:6, G:6, B:10, R:12, K:0 }

function pv(t: string, promoted: boolean) {
  return promoted ? (PROMO[t] ?? 0) : (BASE[t] ?? 0)
}

/* evaluate from the perspective of state.turn */
function evaluate(state: GameState): number {
  const me = state.turn
  const en: Owner = opp(me)
  let s = 0
  for (const row of state.board)
    for (const cell of row) {
      if (!cell || cell.t === 'K') continue
      const v = pv(cell.t, cell.p)
      if (cell.o === me) s += v; else s -= v
    }
  for (const [t, n] of Object.entries(state.hands[me])) s += (BASE[t] ?? 0) * (n as number)
  for (const [t, n] of Object.entries(state.hands[en]))  s -= (BASE[t] ?? 0) * (n as number)
  return s
}

function getAllMoves(state: GameState): (Move | Drop)[] {
  const out: (Move | Drop)[] = []
  const who = state.turn

  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const cell = state.board[r][c]
      if (!cell || cell.o !== who) continue
      for (const t of legalTargetsFrom(state, r, c)) {
        const must = mustPromote(cell, t.r)
        const can  = canPromote(cell, r, t.r)
        if (can) out.push({ from: {r,c}, to: {r:t.r,c:t.c}, promote: true })
        if (!must) out.push({ from: {r,c}, to: {r:t.r,c:t.c}, promote: false })
      }
    }

  for (const t of HAND_TYPES)
    if ((state.hands[who][t] || 0) > 0)
      for (const d of legalDrops(state, t))
        out.push({ drop: t as HandType, to: {r:d.r,c:d.c} })

  return out
}

/* MVV-LVA move ordering */
function mScore(m: Move | Drop, state: GameState): number {
  if ('drop' in m) return BASE[m.drop] ?? 0
  const victim = state.board[m.to.r][m.to.c]
  if (!victim) return m.promote ? 5 : 1
  const att = state.board[m.from.r][m.from.c]!
  return pv(victim.t, victim.p) * 10 - pv(att.t, att.p) + (m.promote ? 5 : 0) + 100
}

function sortMoves(moves: (Move | Drop)[], state: GameState) {
  moves.sort((a, b) => mScore(b, state) - mScore(a, state))
}

let deadline = 0

function negamax(state: GameState, depth: number, alpha: number, beta: number): number {
  if (Date.now() > deadline) throw 0

  const status = gameStatus(state)
  if (status.over) return -MATE
  if (depth === 0) return evaluate(state)

  const moves = getAllMoves(state)
  if (!moves.length) return -MATE
  sortMoves(moves, state)

  for (const m of moves) {
    const score = -negamax(apply(state, m), depth - 1, -beta, -alpha)
    if (score > alpha) alpha = score
    if (alpha >= beta) break
  }
  return alpha
}

function findBestMove(state: GameState, maxDepth: number, timeLimitMs: number): Move | Drop | null {
  deadline = Date.now() + timeLimitMs
  let best: Move | Drop | null = null

  try {
    for (let depth = 1; depth <= maxDepth; depth++) {
      const moves = getAllMoves(state)
      if (!moves.length) break
      sortMoves(moves, state)

      let alpha = -Infinity
      let bestNow: Move | Drop | null = null

      for (const m of moves) {
        if (Date.now() > deadline) throw 0
        const score = -negamax(apply(state, m), depth - 1, -Infinity, -alpha)
        if (score > alpha) { alpha = score; bestNow = m }
      }
      if (bestNow) best = bestNow
    }
  } catch {
    /* timeout — return best found so far */
  }

  if (!best) {
    const moves = getAllMoves(state)
    best = moves[0] ?? null
  }
  return best
}

self.onmessage = (e: MessageEvent<{ type: string; state: GameState; depth: number; timeMs: number }>) => {
  const { type, state, depth, timeMs } = e.data
  if (type !== 'SEARCH') return
  const move = findBestMove(state, depth, timeMs ?? 2000)
  self.postMessage({ move })
}
