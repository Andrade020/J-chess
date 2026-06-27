export type Owner = 'l' | 'd'
export type PieceType = 'K' | 'R' | 'B' | 'G' | 'S' | 'N' | 'L' | 'P'
export type HandType = Exclude<PieceType, 'K'>
export type EffType = PieceType | 'DR' | 'HO'

export interface Cell {
  t: PieceType
  o: Owner
  p: boolean
}

export type BoardRow = (Cell | null)[]
export type Board = BoardRow[]

export type Hand = Record<HandType, number>

export interface GameState {
  board: Board
  hands: { l: Hand; d: Hand }
  turn: Owner
}

export interface Move {
  from: { r: number; c: number }
  to: { r: number; c: number }
  promote: boolean
}

export interface Drop {
  drop: HandType
  to: { r: number; c: number }
}

export type Action = Move | Drop

export interface Target {
  r: number
  c: number
  capture: boolean
}

export interface GameStatus {
  over: boolean
  check: boolean
  mate?: boolean
  winner?: Owner
}

export type PieceSet = 'cls' | 'min' | 'kan' | 'sam' | 'oli' | 'com' | 'geo' | 'flt' | 'neo' | 'got' | 'msk'
export type BoardTheme = 'wood' | 'green' | 'ocean' | 'stone' | 'night' | 'sand'

export interface Settings {
  set: PieceSet
  alt: boolean
  theme: BoardTheme
}

export interface HistoryEntry {
  cell: Cell
  text: string
}

export type SelectionKind =
  | { kind: 'board'; r: number; c: number; targets: Target[] }
  | { kind: 'hand'; owner: Owner; type: HandType; targets: Target[] }
