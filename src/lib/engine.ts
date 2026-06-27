import type { Board, Cell, Drop, EffType, GameState, GameStatus, Hand, HandType, Move, Owner, PieceType, Target } from './types'

const HAND_TYPES: HandType[] = ['P', 'L', 'N', 'S', 'G', 'B', 'R']

function emptyHand(): Hand {
  return { P: 0, L: 0, N: 0, S: 0, G: 0, B: 0, R: 0 }
}

export function clone(s: GameState): GameState {
  return {
    board: s.board.map(row => row.map(c => (c ? { t: c.t, o: c.o, p: c.p } : null))),
    hands: { l: { ...s.hands.l }, d: { ...s.hands.d } },
    turn: s.turn,
  }
}

export function newGame(): GameState {
  const board: Board = Array.from({ length: 9 }, () => Array(9).fill(null))
  const back: PieceType[] = ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L']
  for (let c = 0; c < 9; c++) {
    board[0][c] = { t: back[c], o: 'd', p: false }
    board[8][c] = { t: back[c], o: 'l', p: false }
  }
  board[1][1] = { t: 'R', o: 'd', p: false }
  board[1][7] = { t: 'B', o: 'd', p: false }
  board[7][1] = { t: 'B', o: 'l', p: false }
  board[7][7] = { t: 'R', o: 'l', p: false }
  for (let c = 0; c < 9; c++) {
    board[2][c] = { t: 'P', o: 'd', p: false }
    board[6][c] = { t: 'P', o: 'l', p: false }
  }
  return { board, hands: { l: emptyHand(), d: emptyHand() }, turn: 'l' }
}

export function opp(o: Owner): Owner {
  return o === 'l' ? 'd' : 'l'
}

export function effType(cell: Cell): EffType {
  if (!cell.p) return cell.t
  if (cell.t === 'R') return 'DR'
  if (cell.t === 'B') return 'HO'
  return 'G'
}

interface MoveSpec {
  steps?: [number, number][]
  jumps?: [number, number][]
  slides?: [number, number][]
}

function moveSpec(cell: Cell): MoveSpec {
  const f = cell.o === 'l' ? -1 : 1
  switch (effType(cell)) {
    case 'K': return { steps: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]] }
    case 'G': return { steps: [[f,0],[f,-1],[f,1],[0,-1],[0,1],[-f,0]] }
    case 'S': return { steps: [[f,0],[f,-1],[f,1],[-f,-1],[-f,1]] }
    case 'N': return { jumps: [[2*f,-1],[2*f,1]] }
    case 'L': return { slides: [[f,0]] }
    case 'P': return { steps: [[f,0]] }
    case 'B': return { slides: [[-1,-1],[-1,1],[1,-1],[1,1]] }
    case 'R': return { slides: [[-1,0],[1,0],[0,-1],[0,1]] }
    case 'HO': return { slides: [[-1,-1],[-1,1],[1,-1],[1,1]], steps: [[-1,0],[1,0],[0,-1],[0,1]] }
    case 'DR': return { slides: [[-1,0],[1,0],[0,-1],[0,1]], steps: [[-1,-1],[-1,1],[1,-1],[1,1]] }
    default: return {}
  }
}

function onBoard(r: number, c: number) {
  return r >= 0 && r < 9 && c >= 0 && c < 9
}

export function genMoves(state: GameState, r: number, c: number): Target[] {
  const cell = state.board[r][c]
  if (!cell) return []
  const sp = moveSpec(cell)
  const out: Target[] = []

  for (const [dr, dc] of sp.steps ?? []) {
    const rr = r + dr, cc = c + dc
    if (!onBoard(rr, cc)) continue
    const t = state.board[rr][cc]
    if (!t || t.o !== cell.o) out.push({ r: rr, c: cc, capture: !!t })
  }
  for (const [dr, dc] of sp.jumps ?? []) {
    const rr = r + dr, cc = c + dc
    if (!onBoard(rr, cc)) continue
    const t = state.board[rr][cc]
    if (!t || t.o !== cell.o) out.push({ r: rr, c: cc, capture: !!t })
  }
  for (const [dr, dc] of sp.slides ?? []) {
    let rr = r + dr, cc = c + dc
    while (onBoard(rr, cc)) {
      const t = state.board[rr][cc]
      if (!t) {
        out.push({ r: rr, c: cc, capture: false })
      } else {
        if (t.o !== cell.o) out.push({ r: rr, c: cc, capture: true })
        break
      }
      rr += dr; cc += dc
    }
  }
  return out
}

export function kingPos(state: GameState, owner: Owner): { r: number; c: number } | null {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cl = state.board[i][j]
      if (cl && cl.o === owner && cl.t === 'K') return { r: i, c: j }
    }
  }
  return null
}

export function isAttacked(state: GameState, r: number, c: number, by: Owner): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cl = state.board[i][j]
      if (cl && cl.o === by) {
        const mv = genMoves(state, i, j)
        if (mv.some(m => m.r === r && m.c === c)) return true
      }
    }
  }
  return false
}

export function inCheck(state: GameState, owner: Owner): boolean {
  const k = kingPos(state, owner)
  if (!k) return false
  return isAttacked(state, k.r, k.c, opp(owner))
}

export function apply(state: GameState, mv: Move | Drop): GameState {
  const ns = clone(state)
  const b = ns.board
  const who = state.turn

  if ('drop' in mv) {
    b[mv.to.r][mv.to.c] = { t: mv.drop, o: who, p: false }
    ns.hands[who][mv.drop]--
  } else {
    const pc = b[mv.from.r][mv.from.c]!
    const cap = b[mv.to.r][mv.to.c]
    if (cap && cap.t !== 'K') {
      ns.hands[who][cap.t as HandType] = (ns.hands[who][cap.t as HandType] || 0) + 1
    }
    b[mv.to.r][mv.to.c] = { t: pc.t, o: pc.o, p: pc.p || !!mv.promote }
    b[mv.from.r][mv.from.c] = null
  }
  ns.turn = opp(who)
  return ns
}

export function legalTargetsFrom(state: GameState, r: number, c: number): Target[] {
  const cell = state.board[r][c]
  if (!cell || cell.o !== state.turn) return []
  return genMoves(state, r, c).filter(t => {
    const ns = apply(state, { from: { r, c }, to: { r: t.r, c: t.c }, promote: false })
    return !inCheck(ns, cell.o)
  })
}

export function inZone(owner: Owner, r: number): boolean {
  return owner === 'l' ? r <= 2 : r >= 6
}

export function mustPromote(cell: Cell, toR: number): boolean {
  if (cell.p) return false
  if (cell.t === 'P' || cell.t === 'L') return cell.o === 'l' ? toR === 0 : toR === 8
  if (cell.t === 'N') return cell.o === 'l' ? toR <= 1 : toR >= 7
  return false
}

export function canPromote(cell: Cell, fromR: number, toR: number): boolean {
  if (cell.p) return false
  if (!(['P', 'L', 'N', 'S', 'R', 'B'] as PieceType[]).includes(cell.t)) return false
  return inZone(cell.o, fromR) || inZone(cell.o, toR)
}

function dropAllowed(state: GameState, type: HandType, owner: Owner, r: number, c: number): boolean {
  if (state.board[r][c]) return false
  if (type === 'P' || type === 'L') {
    if (owner === 'l' && r === 0) return false
    if (owner === 'd' && r === 8) return false
  }
  if (type === 'N') {
    if (owner === 'l' && r <= 1) return false
    if (owner === 'd' && r >= 7) return false
  }
  if (type === 'P') {
    for (let i = 0; i < 9; i++) {
      const cl = state.board[i][c]
      if (cl && cl.o === owner && cl.t === 'P' && !cl.p) return false
    }
  }
  return true
}

export function legalDropsLite(state: GameState, type: HandType): Target[] {
  const owner = state.turn
  if ((state.hands[owner][type] || 0) < 1) return []
  const res: Target[] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!dropAllowed(state, type, owner, r, c)) continue
      const ns = apply(state, { drop: type, to: { r, c } })
      if (inCheck(ns, owner)) continue
      res.push({ r, c, capture: false })
    }
  }
  return res
}

export function legalDrops(state: GameState, type: HandType): Target[] {
  const owner = state.turn
  let res = legalDropsLite(state, type)
  if (type === 'P') {
    res = res.filter(({ r, c }) => {
      const ns = apply(state, { drop: 'P', to: { r, c } })
      if (inCheck(ns, opp(owner)) && !hasAnyLegal(ns)) return false
      return true
    })
  }
  return res
}

export function hasAnyLegal(state: GameState): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cl = state.board[r][c]
      if (cl && cl.o === state.turn && legalTargetsFrom(state, r, c).length) return true
    }
  }
  for (const t of HAND_TYPES) {
    if ((state.hands[state.turn][t] || 0) > 0 && legalDropsLite(state, t).length) return true
  }
  return false
}

export function gameStatus(state: GameState): GameStatus {
  const check = inCheck(state, state.turn)
  if (hasAnyLegal(state)) return { over: false, check }
  return { over: true, check, mate: check, winner: opp(state.turn) }
}

export { HAND_TYPES }
