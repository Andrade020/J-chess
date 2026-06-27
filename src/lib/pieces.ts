import type { Cell, PieceSet } from './types'

const SUF: Record<string, string> = {
  K: 'king', R: 'rook', B: 'bishop', G: 'marshal',
  S: 'vanguard', N: 'knight', L: 'lancer', P: 'pawn',
}
const PSUF: Record<string, string> = {
  P: 'pawn-plus', L: 'lancer-plus', N: 'knight-plus', S: 'vanguard-plus',
  R: 'dragonking', B: 'dragonhorse',
}

export function symId(cell: Cell, set: PieceSet): string {
  const base = cell.p ? (PSUF[cell.t] ?? SUF[cell.t]) : SUF[cell.t]
  const prefix = set === 'cls' ? 'c-' : set === 'min' ? 'p-' : set === 'kan' ? 'k-'
    : set === 'geo' ? 'g-' : set === 'flt' ? 'f-' : set === 'neo' ? 'n-' : set === 'got' ? 'o-'
    : set === 'msk' ? 'm-' : 'img-' // sam/oli/com use img path
  return prefix + base
}

export function pieceClasses(cell: Cell, set: PieceSet): string {
  const setClass = set === 'cls' ? 'set-cls' : set === 'min' ? 'set-min' : set === 'kan' ? 'set-kan'
    : set === 'geo' ? 'set-geo' : set === 'flt' ? 'set-flt' : set === 'neo' ? 'set-neo' : set === 'got' ? 'set-got'
    : set === 'msk' ? 'set-msk' : set === 'sam' ? 'set-sam' : set === 'oli' ? 'set-oli' : 'set-com'
  const ownClass = cell.o === 'l' ? 'own-light' : 'own-dark'
  return `${setClass} ${ownClass}`
}

export function coord(r: number, c: number): string {
  return 'ABCDEFGHI'[c] + (9 - r)
}

export const PIECE_NAMES: Record<string, string> = {
  K: 'Rei', R: 'Torre', B: 'Bispo', G: 'Marechal',
  S: 'Vanguarda', N: 'Cavaleiro', L: 'Lanceiro', P: 'Soldado',
}
