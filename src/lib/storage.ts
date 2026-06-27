import type { GameState, HistoryEntry, Settings } from './types'

const GKEY = 'jchess.v1.game'
const SKEY = 'jchess.v1.settings'

export interface SavedGame {
  state: GameState
  history: GameState[]
  notation: HistoryEntry[]
  lastMove: { from?: { r: number; c: number }; to: { r: number; c: number } } | null
  clockCfg?: { secs: number; inc: number } | null
  clocks?: { l: number; d: number }
}

export function loadSettings(): Settings | null {
  try {
    const raw = localStorage.getItem(SKEY)
    if (!raw) return null
    return JSON.parse(raw) as Settings
  } catch {
    return null
  }
}

export function saveSettings(s: Settings) {
  try { localStorage.setItem(SKEY, JSON.stringify(s)) } catch { /* noop */ }
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(GKEY)
    if (!raw) return null
    const d = JSON.parse(raw) as SavedGame
    if (!d?.state?.board || d.state.board.length !== 9) return null
    return d
  } catch {
    return null
  }
}

export function saveGame(g: SavedGame) {
  try { localStorage.setItem(GKEY, JSON.stringify(g)) } catch { /* noop */ }
}
