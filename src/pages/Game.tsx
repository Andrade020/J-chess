import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PieceDefs from '../components/PieceDefs'
import PieceSVG from '../components/PieceSVG'
import type {
  BoardTheme, Cell, GameState, HandType, HistoryEntry,
  Owner, PieceSet, SelectionKind, Settings, Target,
} from '../lib/types'
import { THEMES, THEME_LABELS } from '../lib/themes'
import {
  apply, canPromote, gameStatus, HAND_TYPES, kingPos,
  legalDrops, legalTargetsFrom, mustPromote, newGame,
} from '../lib/engine'
import { coord } from '../lib/pieces'
import { loadGame, loadSettings, saveGame, saveSettings } from '../lib/storage'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { sounds } from '../lib/sounds'
import { detectOpening } from '../lib/openings'

/* ─── clock ─── */
const TIME_CONTROLS = [
  { label: 'Sem tempo', secs: 0,    inc: 0,  cat: '' },
  { label: '1 min',     secs: 60,   inc: 0,  cat: 'Bala' },
  { label: '1+1',       secs: 60,   inc: 1,  cat: 'Bala' },
  { label: '2+1',       secs: 120,  inc: 1,  cat: 'Bala' },
  { label: '3 min',     secs: 180,  inc: 0,  cat: 'Blitz' },
  { label: '3+2',       secs: 180,  inc: 2,  cat: 'Blitz' },
  { label: '5 min',     secs: 300,  inc: 0,  cat: 'Blitz' },
  { label: '5+3',       secs: 300,  inc: 3,  cat: 'Blitz' },
  { label: '10 min',    secs: 600,  inc: 0,  cat: 'Rápido' },
  { label: '15+10',     secs: 900,  inc: 10, cat: 'Rápido' },
  { label: '30 min',    secs: 1800, inc: 0,  cat: 'Rápido' },
  { label: '60 min',    secs: 3600, inc: 0,  cat: 'Clássico' },
] as const

function formatClock(secs: number): string {
  if (secs <= 0) return '0:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function ClockBar({ side, secs, active }: { side: Owner; secs: number; active: boolean }) {
  const low = secs > 0 && secs < 30
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: active ? 'var(--panel2)' : 'var(--panel)',
      border: `1px solid ${active ? 'var(--wood-d)' : 'var(--line)'}`,
      borderRadius: '10px', padding: '5px 12px', transition: 'background .2s, border-color .2s',
    }}>
      <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.06em', color: 'var(--muted)' }}>
        {side === 'd' ? 'ESCURO' : 'CLARO'}
      </span>
      <span style={{
        fontFamily: '"Space Mono",monospace', fontSize: '22px', fontWeight: 700,
        color: secs === 0 ? 'var(--warn)' : low ? '#e07830' : 'var(--ink)',
        letterSpacing: '-.02em', lineHeight: 1,
      }}>
        {formatClock(secs)}
      </span>
    </div>
  )
}

/* ─── material score ─── */
const PIECE_VAL: Record<HandType, number> = { P: 1, L: 3, N: 4, S: 5, G: 6, B: 8, R: 10 }

function calcMaterial(state: GameState): { l: number; d: number } {
  let l = 0, d = 0
  for (const row of state.board) {
    for (const cell of row) {
      if (!cell || cell.t === 'K') continue
      let val: number
      if (cell.p) {
        if (cell.t === 'R') val = 12
        else if (cell.t === 'B') val = 10
        else if (cell.t === 'P') val = 7
        else val = 6  // PL, PN, PS → gold equivalent
      } else {
        val = PIECE_VAL[cell.t as HandType]
      }
      if (cell.o === 'l') l += val; else d += val
    }
  }
  for (const [t, n] of Object.entries(state.hands.l)) l += PIECE_VAL[t as HandType] * (n as number)
  for (const [t, n] of Object.entries(state.hands.d)) d += PIECE_VAL[t as HandType] * (n as number)
  return { l, d }
}

function PlayerPanel({ side, secs, active, hasClock, matLead }: {
  side: Owner; secs: number; active: boolean; hasClock: boolean; matLead: number
}) {
  const low = hasClock && secs > 0 && secs < 30
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      width: '100%', boxSizing: 'border-box',
      background: active && hasClock ? 'var(--panel2)' : 'var(--panel)',
      border: `1px solid ${active && hasClock ? 'var(--wood-d)' : 'var(--line)'}`,
      borderRadius: '10px', padding: '5px',
      transition: 'background .15s, border-color .15s',
    }}>
      {/* player identifier — future: swap dot+label for avatar+name+rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
          background: side === 'l' ? '#e8d9b0' : '#28241e',
          border: '1.5px solid var(--line)',
        }} />
        <span style={{
          fontFamily: '"Space Mono",monospace', fontSize: '8px',
          letterSpacing: 0, textTransform: 'uppercase', color: 'var(--muted)',
          overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          {side === 'd' ? 'Escuro' : 'Claro'}
        </span>
      </div>
      {matLead > 0 && (
        <span style={{
          fontFamily: '"Space Mono",monospace', fontSize: '9px', fontWeight: 700,
          color: 'var(--accent)',
        }}>+{matLead}</span>
      )}
      {/* clock (only when a time control is active) */}
      {hasClock && (
        <span style={{
          fontFamily: '"Space Mono",monospace', fontWeight: 700, fontSize: '14px',
          color: secs === 0 ? 'var(--warn)' : low ? '#e07830' : 'var(--ink)',
          letterSpacing: '-.02em', lineHeight: 1,
          overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          {formatClock(secs)}
        </span>
      )}
    </div>
  )
}

/* ─── state ─── */
interface GameUiState {
  state: GameState
  history: GameState[]
  notation: HistoryEntry[]
  lastMove: { from?: { r: number; c: number }; to: { r: number; c: number } } | null
  sel: SelectionKind | null
  settings: Settings
  pendingPromo: { fr: number; fc: number; tr: number; tc: number; cell: Cell } | null
}

type Action =
  | { type: 'SELECT_BOARD'; r: number; c: number; targets: Target[] }
  | { type: 'SELECT_HAND'; owner: Owner; htype: HandType; targets: Target[] }
  | { type: 'DESELECT' }
  | { type: 'MOVE'; fr: number; fc: number; tr: number; tc: number; promote: boolean; cap: boolean; cell: Cell }
  | { type: 'DROP'; htype: HandType; r: number; c: number }
  | { type: 'ASK_PROMO'; fr: number; fc: number; tr: number; tc: number; cell: Cell }
  | { type: 'UNDO' }
  | { type: 'NEW_GAME' }
  | { type: 'SET_SET'; set: PieceSet }
  | { type: 'SET_THEME'; theme: BoardTheme }
  | { type: 'TOGGLE_ALT' }

function reducer(ui: GameUiState, action: Action): GameUiState {
  switch (action.type) {
    case 'SELECT_BOARD':
      return { ...ui, sel: { kind: 'board', r: action.r, c: action.c, targets: action.targets } }
    case 'SELECT_HAND':
      return { ...ui, sel: { kind: 'hand', owner: action.owner, type: action.htype, targets: action.targets } }
    case 'DESELECT':
      return { ...ui, sel: null }

    case 'ASK_PROMO':
      return { ...ui, sel: null, pendingPromo: { fr: action.fr, fc: action.fc, tr: action.tr, tc: action.tc, cell: action.cell } }

    case 'MOVE': {
      const newState = apply(ui.state, {
        from: { r: action.fr, c: action.fc },
        to: { r: action.tr, c: action.tc },
        promote: action.promote,
      })
      const glyph: Cell = { t: action.cell.t, o: action.cell.o, p: action.cell.p || action.promote }
      const entry: HistoryEntry = {
        cell: glyph,
        text: coord(action.fr, action.fc) + (action.cap ? '×' : '–') + coord(action.tr, action.tc) + (action.promote ? '+' : ''),
      }
      return {
        ...ui,
        state: newState,
        history: [...ui.history, ui.state],
        notation: [...ui.notation, entry],
        lastMove: { from: { r: action.fr, c: action.fc }, to: { r: action.tr, c: action.tc } },
        sel: null,
        pendingPromo: null,
      }
    }

    case 'DROP': {
      const owner = ui.state.turn
      const newState = apply(ui.state, { drop: action.htype, to: { r: action.r, c: action.c } })
      const entry: HistoryEntry = {
        cell: { t: action.htype, o: owner, p: false },
        text: '✦' + coord(action.r, action.c),
      }
      return {
        ...ui,
        state: newState,
        history: [...ui.history, ui.state],
        notation: [...ui.notation, entry],
        lastMove: { to: { r: action.r, c: action.c } },
        sel: null,
      }
    }

    case 'UNDO': {
      if (!ui.history.length) return ui
      const prev = ui.history[ui.history.length - 1]
      return {
        ...ui,
        state: prev,
        history: ui.history.slice(0, -1),
        notation: ui.notation.slice(0, -1),
        lastMove: null,
        sel: null,
        pendingPromo: null,
      }
    }

    case 'NEW_GAME':
      return { ...ui, state: newGame(), history: [], notation: [], lastMove: null, sel: null, pendingPromo: null }

    case 'SET_SET': {
      const settings = { ...ui.settings, set: action.set }
      saveSettings(settings)
      return { ...ui, settings }
    }
    case 'SET_THEME': {
      const settings = { ...ui.settings, theme: action.theme }
      saveSettings(settings)
      return { ...ui, settings }
    }
    case 'TOGGLE_ALT': {
      const settings = { ...ui.settings, alt: !ui.settings.alt }
      saveSettings(settings)
      return { ...ui, settings }
    }

    default:
      return ui
  }
}

function initialState(): GameUiState {
  const settings: Settings = { set: 'cls', alt: true, theme: 'wood', ...loadSettings() }
  const saved = loadGame()
  return {
    state: saved?.state ?? newGame(),
    history: saved?.history ?? [],
    notation: saved?.notation ?? [],
    lastMove: saved?.lastMove ?? null,
    sel: null,
    settings,
    pendingPromo: null,
  }
}

/* ─── component ─── */
export default function Game() {
  const [ui, dispatch] = useReducer(reducer, undefined, initialState)
  const { state, history, notation, lastMove, sel, settings, pendingPromo } = ui
  const { profile, signOut } = useAuth()
  const status = gameStatus(state)
  const opening = detectOpening(state, notation.length)
  const theme = THEMES[settings.theme]
  const [showSettings, setShowSettings] = useState(false)
  const [showNewGame, setShowNewGame] = useState(false)
  const [selectedTc, setSelectedTc] = useState(0)
  const [newGameMode, setNewGameMode] = useState<'ai' | 'local' | 'online'>('ai')
  const [onlineWaitId, setOnlineWaitId] = useState<string | null>(null)
  const [clockCfg, setClockCfg] = useState<{ secs: number; inc: number } | null>(
    () => loadGame()?.clockCfg ?? null
  )
  const [clocks, setClocks] = useState<{ l: number; d: number }>(
    () => loadGame()?.clocks ?? { l: 0, d: 0 }
  )
  const prevHistLen = useRef(loadGame()?.notation?.length ?? 0)
  const historyEl = useRef<HTMLDivElement>(null)
  const boardGridRef = useRef<HTMLDivElement>(null)
  const dragFloatEl = useRef<HTMLDivElement | null>(null)
  const dragInitialPos = useRef<{ x: number; y: number } | null>(null)
  const dragActive = useRef(false)

  /* always-current refs for stale-closure-safe event handlers */
  const selRef = useRef(sel); selRef.current = sel
  const stateRef = useRef(state); stateRef.current = state
  const statusRef = useRef(status); statusRef.current = status
  const pendingPromoRef = useRef(pendingPromo); pendingPromoRef.current = pendingPromo

  /* ── AI mode ── */
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAiMode = searchParams.get('mode') !== 'local'
  const workerRef = useRef<Worker | null>(null)
  const aiSearching = useRef(false)

  useEffect(() => {
    if (!isAiMode) return
    const w = new Worker(new URL('../workers/ai.worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (e: MessageEvent) => {
      aiSearching.current = false
      const { move } = e.data
      if (!move) return
      if ('drop' in move) {
        dispatch({ type: 'DROP', htype: move.drop, r: move.to.r, c: move.to.c })
      } else {
        const s = stateRef.current
        const cell = s.board[move.from.r][move.from.c]
        if (!cell) return
        const cap = !!s.board[move.to.r][move.to.c]
        dispatch({ type: 'MOVE', fr: move.from.r, fc: move.from.c, tr: move.to.r, tc: move.to.c, promote: move.promote, cap, cell })
      }
    }
    workerRef.current = w
    return () => { w.terminate(); workerRef.current = null }
  }, [isAiMode]) // eslint-disable-line

  useEffect(() => {
    if (!isAiMode || status.over || state.turn !== 'd' || pendingPromo || aiSearching.current) return
    if (!workerRef.current) return
    aiSearching.current = true
    workerRef.current.postMessage({ type: 'SEARCH', state, depth: 5, timeMs: 2000 })
  }, [isAiMode, state, status.over, pendingPromo]) // eslint-disable-line

  /* lobby realtime: quando oponente aceita desafio online, navegar para a partida */
  useEffect(() => {
    if (!onlineWaitId) return
    const ch = supabase.channel(`lobby-wait-${onlineWaitId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobby', filter: `id=eq.${onlineWaitId}` },
        (payload) => {
          const gameId = (payload.new as { game_id: string | null }).game_id
          if (gameId) {
            supabase.from('lobby').delete().eq('id', onlineWaitId)
            setOnlineWaitId(null)
            setShowNewGame(false)
            navigate(`/game/${gameId}`)
          }
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [onlineWaitId, navigate])

  const [drag, setDrag] = useState<
    | { kind: 'board'; origin: { r: number; c: number }; cell: Cell; cellSizePx: number }
    | { kind: 'hand'; htype: HandType; owner: Owner; cell: Cell; cellSizePx: number }
    | null
  >(null)

  /* persist on every state change (clocks included — ticks every second when active) */
  useEffect(() => {
    saveGame({ state, history, notation, lastMove, clockCfg, clocks })
  }, [state, history, notation, lastMove, clockCfg, clocks])

  const historyMobileEl = useRef<HTMLDivElement>(null)

  /* auto-scroll history — both panels; display:none ones ignore scrollTop */
  useEffect(() => {
    if (historyEl.current) historyEl.current.scrollTop = historyEl.current.scrollHeight
    if (historyMobileEl.current) historyMobileEl.current.scrollTop = historyMobileEl.current.scrollHeight
  }, [notation])

  /* sounds */
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    if (!lastMove) return
    const last = notation[notation.length - 1]
    const cap = last?.text.includes('×') ?? false
    if (status.over) sounds.gameOver()
    else if (status.check) sounds.check()
    else if (cap) sounds.capture()
    else sounds.move()
  }, [lastMove]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── clock tick (1 s interval for the active player) ── */
  const clockWinner: Owner | null = clockCfg
    ? (clocks.d === 0 ? 'l' : clocks.l === 0 ? 'd' : null)
    : null
  const gameOver = status.over || !!clockWinner
  const material = calcMaterial(state)
  const matDiff  = material.l - material.d
  const matLead  = { l: Math.max(0, matDiff), d: Math.max(0, -matDiff) }

  useEffect(() => {
    if (!clockCfg || gameOver) return
    const id = setInterval(() => {
      setClocks(prev => {
        const s = stateRef.current.turn
        return { ...prev, [s]: Math.max(0, prev[s] - 1) }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [clockCfg, gameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── add increment when a move is made ── */
  useEffect(() => {
    if (clockCfg?.inc && history.length > prevHistLen.current) {
      const movedSide: Owner = stateRef.current.turn === 'l' ? 'd' : 'l'
      setClocks(prev => ({ ...prev, [movedSide]: prev[movedSide] + (clockCfg?.inc ?? 0) }))
    }
    prevHistLen.current = history.length
  }, [history.length]) // eslint-disable-line react-hooks/exhaustive-deps

  /* drag-and-drop pointer listeners */
  useEffect(() => {
    if (!drag) return

    function onMove(e: PointerEvent) {
      const d = drag
      if (!d) return
      const el = dragFloatEl.current
      if (!el) return
      if (!dragActive.current && dragInitialPos.current) {
        const dx = e.clientX - dragInitialPos.current.x
        const dy = e.clientY - dragInitialPos.current.y
        if (Math.hypot(dx, dy) > 4) {
          dragActive.current = true
          el.style.display = 'block'
          if (d.kind === 'hand') {
            dispatch({ type: 'SELECT_HAND', owner: d.owner, htype: d.htype, targets: legalDrops(stateRef.current, d.htype) })
          }
        }
      }
      if (dragActive.current) {
        el.style.left = `${e.clientX}px`
        el.style.top = `${e.clientY}px`
      }
    }

    function onUp(e: PointerEvent) {
      const d = drag
      if (!d) return
      const wasHandDrag = d.kind === 'hand'
      const wasActive   = dragActive.current
      setDrag(null)
      dragActive.current = false
      dragInitialPos.current = null

      // Clique puro na mão (sem arrastar): deixa o onClick do chip lidar
      if (wasHandDrag && !wasActive) return

      const grid = boardGridRef.current
      if (!grid) { dispatch({ type: 'DESELECT' }); return }

      const rect = grid.getBoundingClientRect()
      const x = e.clientX, y = e.clientY
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        dispatch({ type: 'DESELECT' })
        return
      }
      const r = Math.floor((y - rect.top) / (rect.height / 9))
      const c = Math.floor((x - rect.left) / (rect.width / 9))
      if (r < 0 || r > 8 || c < 0 || c > 8) { dispatch({ type: 'DESELECT' }); return }

      const curSel = selRef.current
      const curState = stateRef.current
      if (!curSel || statusRef.current.over || pendingPromoRef.current) {
        dispatch({ type: 'DESELECT' }); return
      }

      const tgt = curSel.targets.find(t => t.r === r && t.c === c)
      if (!tgt) {
        const landCell = curState.board[r][c]
        if (landCell && landCell.o === curState.turn) {
          dispatch({ type: 'SELECT_BOARD', r, c, targets: legalTargetsFrom(curState, r, c) })
        } else {
          dispatch({ type: 'DESELECT' })
        }
        return
      }

      if (curSel.kind === 'board') {
        const cell = curState.board[curSel.r][curSel.c]!
        const cap = !!curState.board[r][c]
        if (mustPromote(cell, r)) {
          dispatch({ type: 'MOVE', fr: curSel.r, fc: curSel.c, tr: r, tc: c, promote: true, cap, cell })
        } else if (canPromote(cell, curSel.r, r)) {
          dispatch({ type: 'ASK_PROMO', fr: curSel.r, fc: curSel.c, tr: r, tc: c, cell })
        } else {
          dispatch({ type: 'MOVE', fr: curSel.r, fc: curSel.c, tr: r, tc: c, promote: false, cap, cell })
        }
      } else {
        dispatch({ type: 'DROP', htype: curSel.type, r, c })
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── board interaction ─── */
  function targetAt(r: number, c: number): Target | undefined {
    return sel?.targets.find(t => t.r === r && t.c === c)
  }

  const handleSquare = useCallback((r: number, c: number) => {
    if (status.over || pendingPromo) return
    if (sel) {
      const t = targetAt(r, c)
      if (t) {
        if (sel.kind === 'board') {
          const cell = state.board[sel.r][sel.c]!
          const cap = !!state.board[r][c]
          if (mustPromote(cell, r)) {
            dispatch({ type: 'MOVE', fr: sel.r, fc: sel.c, tr: r, tc: c, promote: true, cap, cell })
          } else if (canPromote(cell, sel.r, r)) {
            dispatch({ type: 'ASK_PROMO', fr: sel.r, fc: sel.c, tr: r, tc: c, cell })
          } else {
            dispatch({ type: 'MOVE', fr: sel.r, fc: sel.c, tr: r, tc: c, promote: false, cap, cell })
          }
        } else {
          dispatch({ type: 'DROP', htype: sel.type, r, c })
        }
        return
      }
    }
    const cell = state.board[r][c]
    if (cell && cell.o === state.turn) {
      const targets = legalTargetsFrom(state, r, c)
      dispatch({ type: 'SELECT_BOARD', r, c, targets })
    } else {
      dispatch({ type: 'DESELECT' })
    }
  }, [sel, state, status.over, pendingPromo]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleHand(owner: Owner, htype: HandType) {
    if (status.over || owner !== state.turn) return
    if (sel?.kind === 'hand' && sel.type === htype) {
      dispatch({ type: 'DESELECT' })
      return
    }
    const targets = legalDrops(state, htype)
    dispatch({ type: 'SELECT_HAND', owner, htype, targets })
  }

  function openNewGame() { setShowNewGame(true) }

  function startNewGame() {
    const tc = TIME_CONTROLS[selectedTc]
    const cfg = tc.secs > 0 ? { secs: tc.secs, inc: tc.inc } : null
    dispatch({ type: 'NEW_GAME' })
    setClockCfg(cfg)
    setClocks({ l: tc.secs, d: tc.secs })
    prevHistLen.current = 0
    setShowNewGame(false)
  }

  async function createOnlineChallenge() {
    if (!profile) return
    const tc = TIME_CONTROLS[selectedTc]
    const { data, error } = await supabase.from('lobby').insert({
      user_id: profile.id,
      time_control_secs: tc.secs > 0 ? tc.secs : null,
      time_control_inc: tc.inc,
    }).select('id').single()
    if (error) {
      alert(`Erro ao criar desafio: ${error.message}`)
    } else if (data) {
      setOnlineWaitId((data as { id: string }).id)
    }
  }

  async function cancelOnlineChallenge() {
    if (onlineWaitId) await supabase.from('lobby').delete().eq('id', onlineWaitId)
    setOnlineWaitId(null)
  }

  function resolvePromo(promote: boolean) {
    if (!pendingPromo) return
    const { fr, fc, tr, tc, cell } = pendingPromo
    const cap = !!state.board[tr][tc]
    dispatch({ type: 'MOVE', fr, fc, tr, tc, promote, cap, cell })
  }

  function onCellPointerDown(e: React.PointerEvent<HTMLDivElement>, r: number, c: number) {
    const cell = state.board[r][c]
    if (!cell || cell.o !== state.turn || status.over || pendingPromo) return
    e.preventDefault()
    const targets = legalTargetsFrom(state, r, c)
    dispatch({ type: 'SELECT_BOARD', r, c, targets })
    const cellSizePx = boardGridRef.current
      ? boardGridRef.current.getBoundingClientRect().width / 9
      : 60
    dragInitialPos.current = { x: e.clientX, y: e.clientY }
    dragActive.current = false
    setDrag({ kind: 'board', origin: { r, c }, cell, cellSizePx })
  }

  function onHandChipPointerDown(e: React.PointerEvent<HTMLDivElement>, owner: Owner, htype: HandType) {
    if (owner !== state.turn || status.over || pendingPromo) return
    e.preventDefault()
    const cellSizePx = boardGridRef.current
      ? boardGridRef.current.getBoundingClientRect().width / 9
      : 60
    dragInitialPos.current = { x: e.clientX, y: e.clientY }
    dragActive.current = false
    setDrag({ kind: 'hand', htype, owner, cell: { t: htype, o: owner, p: false }, cellSizePx })
  }

  const checkKing = status.check ? kingPos(state, state.turn) : null
  const OWNER_LABEL: Record<Owner, string> = { l: 'Claro', d: 'Escuro' }

  /* ─── render helpers ─── */
  function squareCls(r: number, c: number): string {
    const base = ['sq', (r + c) % 2 ? 'lt' : 'dk']
    if (sel?.kind === 'board' && sel.r === r && sel.c === c) base.push('sel')
    const t = targetAt(r, c)
    if (t) base.push(sel?.kind === 'hand' ? 'drop' : t.capture ? 'cap' : 'tgt')
    if (lastMove) {
      if (lastMove.to.r === r && lastMove.to.c === c) base.push('last')
      if (lastMove.from && lastMove.from.r === r && lastMove.from.c === c) base.push('last')
    }
    if (checkKing && checkKing.r === r && checkKing.c === c) base.push('check')
    return base.join(' ')
  }

  /* ─── JSX ─── */
  return (
    <div className="flex flex-col lg:flex-row min-h-dvh lg:h-dvh lg:overflow-hidden">
      <PieceDefs />

      {/* ── mobile topbar (hidden lg+) ── */}
      <header className="flex flex-col lg:hidden" style={{ gap: '8px', padding: '12px 14px 0' }}>
        {/* row 1: logo + settings */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '22px', letterSpacing: '-.01em' }}>
            J-Chess<span style={{ fontFamily: '"Noto Serif JP",serif', fontWeight: 600, fontSize: '.7em', color: 'var(--muted)', marginLeft: '5px' }}>将棋</span>
          </div>
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{
              fontFamily: '"Space Mono",monospace', fontSize: '13px',
              background: showSettings ? 'var(--panel2)' : 'var(--panel)',
              color: 'var(--ink)', border: '1px solid var(--line)',
              borderRadius: '9px', padding: '5px 10px', cursor: 'pointer', lineHeight: 1,
            }}
          >⚙</button>
        </div>
        {/* row 2: turn + undo/new */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid var(--line)', background: state.turn === 'l' ? '#f1e6d0' : '#16130f', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: '"Hanken Grotesk",sans-serif', flex: 1 }}>
            Vez: <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{OWNER_LABEL[state.turn]}</b>
            {status.check && !status.over && <span style={{ color: 'var(--warn)', fontWeight: 700, marginLeft: '6px' }}>Xeque!</span>}
          </span>
          {([
            { label: '↩', title: 'Desfazer', disabled: history.length === 0, action: () => dispatch({ type: 'UNDO' }) },
            { label: '＋', title: 'Novo jogo', disabled: false,              action: () => { openNewGame() } },
          ] as const).map(({ label, title, disabled, action }) => (
            <button key={label} disabled={disabled} onClick={action} title={title} style={{
              fontFamily: '"Space Mono",monospace', fontSize: '14px',
              background: 'var(--panel)', color: 'var(--ink)', border: '1px solid var(--line)',
              borderRadius: '9px', padding: '5px 9px', cursor: 'pointer', lineHeight: 1,
              opacity: disabled ? .4 : 1,
            }}>{label}</button>
          ))}
        </div>
      </header>

      {/* ── desktop sidebar (hidden below lg) ── */}
      <aside className="hidden lg:flex flex-col" style={{ width: '142px', flexShrink: 0, gap: '14px', padding: '20px 14px', borderRight: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {/* ── J-Chess logo ── */}
          <svg viewBox="0 0 60 60" style={{ width: '64px', height: '64px', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" rx="14" fill="#1e1a14"/>
            {/* shogi piece pentagon */}
            <path d="M30,4 L54,19 L49,56 L11,56 L6,19 Z" fill="#d4a830"/>
            {/* inner void */}
            <path d="M30,10 L49,22 L45,52 L15,52 L11,22 Z" fill="#1e1a14"/>
            {/* crown — 3 prongs */}
            <rect x="14" y="25" width="6" height="8" rx="2.5" fill="#d4a830"/>
            <rect x="27" y="20" width="6" height="13" rx="2.5" fill="#d4a830"/>
            <rect x="40" y="25" width="6" height="8" rx="2.5" fill="#d4a830"/>
            {/* crown base */}
            <rect x="13" y="32" width="34" height="4" rx="2" fill="#d4a830"/>
            {/* piece body */}
            <rect x="15" y="36" width="30" height="8" rx="2" fill="#d4a830"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '18px', letterSpacing: '-.01em', lineHeight: 1.1 }}>J-Chess</div>
            <div style={{ fontFamily: '"Noto Serif JP",serif', fontWeight: 600, fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>将棋</div>
          </div>
        </div>
        <div style={{ height: '1px', background: 'var(--line)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid var(--line)', background: state.turn === 'l' ? '#f1e6d0' : '#16130f', flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: '"Hanken Grotesk",sans-serif', lineHeight: 1.3 }}>
            <b style={{ color: 'var(--ink)', fontWeight: 600, display: 'block' }}>{OWNER_LABEL[state.turn]}</b>
            {status.check && !status.over && <span style={{ color: 'var(--warn)', fontWeight: 700, fontSize: '11px', display: 'block' }}>Xeque!</span>}
          </span>
        </div>
        <div style={{ height: '1px', background: 'var(--line)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {([
            { label: '↩ Desfazer', disabled: history.length === 0, action: () => dispatch({ type: 'UNDO' }) },
            { label: '＋ Novo jogo', disabled: false,               action: () => { openNewGame() } },
          ] as const).map(({ label, disabled, action }) => (
            <button key={label} disabled={disabled} onClick={action} style={{
              fontFamily: '"Space Mono",monospace', fontSize: '11px', letterSpacing: '.02em',
              background: 'var(--panel)', color: 'var(--ink)', border: '1px solid var(--line)',
              borderRadius: '9px', padding: '7px 10px', cursor: 'pointer', width: '100%', textAlign: 'left',
              opacity: disabled ? .4 : 1,
            }}>{label}</button>
          ))}
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{
              fontFamily: '"Space Mono",monospace', fontSize: '11px', letterSpacing: '.02em',
              background: showSettings ? 'var(--panel2)' : 'var(--panel)',
              color: 'var(--ink)', border: '1px solid var(--line)',
              borderRadius: '9px', padding: '7px 10px', cursor: 'pointer', lineHeight: 1, width: '100%', textAlign: 'left',
            }}
          >⚙ Config</button>
        </div>
        <div style={{ flex: 1 }} />

        {/* user info */}
        {profile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.username}
              </span>
              <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>
                {profile.is_guest ? 'convidado' : `⭐ ${profile.rating}`}
              </span>
            </div>
            <button
              onClick={signOut}
              style={{
                fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.02em',
                background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)',
                borderRadius: '8px', padding: '5px 8px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              ⇥ Sair
            </button>
          </div>
        )}
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.02em',
            background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)',
            borderRadius: '8px', padding: '5px 8px', cursor: 'pointer', textAlign: 'left', width: '100%',
          }}
        >
          ← Lobby
        </button>
      </aside>

      {/* ── game area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px', minHeight: 0 }}>
        {/* game grid: lg+ = col1 (board, max 680px) | col2 (history, 180px) */}
        <div className="game-grid" style={{ width: '100%' }}>

          {/* player panels: col 1, row 2 (board row) — desktop only; dark top, light bottom */}
          <div className="hidden lg:flex" style={{ gridColumn: 1, gridRow: 2, flexDirection: 'column', justifyContent: 'space-between' }}>
            <PlayerPanel side="d" secs={clocks.d} active={state.turn === 'd' && !gameOver} hasClock={!!clockCfg} matLead={matLead.d} />
            <PlayerPanel side="l" secs={clocks.l} active={state.turn === 'l' && !gameOver} hasClock={!!clockCfg} matLead={matLead.l} />
          </div>

          {/* dark hand: col 2 desktop / col 1 mobile, row 1 */}
          <div className="gcol-main" style={{ gridRow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* clock shown here on mobile only */}
            {clockCfg && <div className="lg:hidden"><ClockBar side="d" secs={clocks.d} active={state.turn === 'd' && !gameOver} /></div>}
            <HandPanel owner="d" state={state} sel={sel} set={settings.set} onChip={handleHand} onChipPointerDown={onHandChipPointerDown} />
          </div>

          {/* board: col 2 desktop / col 1 mobile, row 2 */}
          <div className="gcol-main" style={{ gridRow: 2, minHeight: 0 }}>

        {/* ── board ── */}
        <div className="board-frame" style={{ background: theme.frame, borderRadius: '12px', padding: '8px 8px 20px 20px', boxShadow: '0 14px 30px rgba(0,0,0,.4)' }}>
          {/* rank labels */}
          <div style={{ position: 'absolute', left: 0, top: '8px', bottom: '20px', width: '20px', display: 'flex', flexDirection: 'column' }}>
            {Array.from({ length: 9 }, (_, r) => (
              <span key={r} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Mono",monospace', fontSize: '9.5px', color: theme.label, opacity: .72 }}>{9 - r}</span>
            ))}
          </div>
          {/* file labels */}
          <div style={{ position: 'absolute', left: '20px', right: '8px', bottom: 0, height: '20px', display: 'flex' }}>
            {'ABCDEFGHI'.split('').map(l => (
              <span key={l} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Mono",monospace', fontSize: '9.5px', color: theme.label, opacity: .72 }}>{l}</span>
            ))}
          </div>
          {/* grid */}
          <div
            ref={boardGridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(9,1fr)',
              gridTemplateRows: 'repeat(9,1fr)',
              width: '100%',
              aspectRatio: '1/1',
              background: settings.alt ? undefined : theme.sq,
              border: `1.5px solid ${theme.gridBorder}`,
              borderRadius: '4px',
              overflow: 'hidden',
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            {Array.from({ length: 9 }, (_, r) =>
              Array.from({ length: 9 }, (_, c) => {
                const cell = state.board[r][c]
                const cls = squareCls(r, c)
                const isLt = (r + c) % 2 === 1
                const isDragSrc = drag?.kind === 'board' && drag.origin.r === r && drag.origin.c === c
                let bg = settings.alt ? (isLt ? theme.sqL : theme.sqD) : theme.sq
                if (isDragSrc) bg = theme.dragSrc
                else if (cls.includes('sel')) bg = theme.selSq
                if (cls.includes('check')) bg = theme.checkSq
                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => { if (!drag) handleSquare(r, c) }}
                    onPointerDown={(e) => onCellPointerDown(e, r, c)}
                    style={{
                      position: 'relative',
                      background: bg,
                      borderRight: c < 8 ? '1px solid rgba(58,42,20,.45)' : 'none',
                      borderBottom: r < 8 ? '1px solid rgba(58,42,20,.45)' : 'none',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      minWidth: 0,
                      minHeight: 0,
                    }}
                  >
                    {/* last move highlight, behind piece */}
                    {cls.includes('last') && (
                      <div style={{ position: 'absolute', inset: 0, background: theme.lastMove, pointerEvents: 'none' }} />
                    )}
                    {cell && (
                      <div style={{ position: 'absolute', inset: 0, opacity: isDragSrc ? 0.5 : 1 }}>
                        <PieceSVG cell={cell} set={settings.set} fill />
                      </div>
                    )}
                    {/* target dot */}
                    {cls.includes('tgt') && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '28%', height: '28%', borderRadius: '50%', background: theme.tgt, pointerEvents: 'none' }} />
                    )}
                    {/* capture ring */}
                    {cls.includes('cap') && (
                      <div style={{ position: 'absolute', inset: '5%', borderRadius: '50%', border: `4px solid ${theme.tgt}`, pointerEvents: 'none' }} />
                    )}
                    {/* drop square — centrado com transform */}
                    {cls.includes('drop') && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '28%', height: '28%', borderRadius: '3px', background: 'rgba(63,120,150,.65)', pointerEvents: 'none' }} />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
          </div>{/* end board cell */}

          {/* light hand: col 2 desktop / col 1 mobile, row 3 */}
          <div className="gcol-main" style={{ gridRow: 3, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <HandPanel owner="l" state={state} sel={sel} set={settings.set} onChip={handleHand} onChipPointerDown={onHandChipPointerDown} />
            {/* clock shown here on mobile only */}
            {clockCfg && <div className="lg:hidden"><ClockBar side="l" secs={clocks.l} active={state.turn === 'l' && !gameOver} /></div>}
          </div>


          {/* desktop history: col 3, row 2 — beside board only */}
          <div
            className="hidden lg:flex"
            style={{ gridColumn: 3, gridRow: 2, flexDirection: 'column', gap: '6px', overflow: 'hidden', minHeight: 0 }}
          >
            <div style={{ paddingTop: '2px', paddingBottom: '4px', flexShrink: 0 }}>
              <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Lances
              </div>
              {opening && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: '11px', color: 'var(--ink)', fontWeight: 600, lineHeight: 1.3 }}>
                    {opening.name}
                  </div>
                  <div style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '10px', color: 'var(--muted)', lineHeight: 1.4 }}>
                    {opening.kanji}
                  </div>
                </div>
              )}
            </div>
            <div
              ref={historyEl}
              style={{
                background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px',
                padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: '1px',
                flex: 1, minHeight: 0, overflowY: 'auto',
              }}
            >
              <MoveHistoryItems entries={notation} set={settings.set} />
            </div>
          </div>

          {/* mobile history: col 1, row 4 */}
          <div className="lg:hidden" style={{ gridColumn: 1, gridRow: 4 }}>
            <MoveHistory entries={notation} set={settings.set} elRef={historyMobileEl} maxH="108px" />
          </div>
        </div>{/* end game-grid */}
        {/* ── mobile signature ── */}
        <div className="lg:hidden" style={{ textAlign: 'center', paddingTop: '8px' }}>
          <a href="https://andrade020.github.io/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.06em', color: 'var(--muted)', opacity: .38, textDecoration: 'none' }}>
            lucas andrade
          </a>
        </div>
      </div>{/* end game area */}

      {/* ── novo jogo modal ── */}
      {showNewGame && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,10,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={e => { if (e.target === e.currentTarget && !onlineWaitId) setShowNewGame(false) }}
        >
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '18px', padding: '22px 24px', width: 'min(92vw,380px)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '16px' }}>Novo jogo</span>
              {!onlineWaitId && (
                <button onClick={() => setShowNewGame(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '2px 6px' }}>×</button>
              )}
            </div>

            {/* mode selector */}
            <div>
              <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '9px', letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Modo</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {([
                  { key: 'ai',     label: 'vs IA' },
                  { key: 'local',  label: 'vs Humano' },
                  { key: 'online', label: 'Online' },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { if (!onlineWaitId) setNewGameMode(key) }}
                    style={{
                      flex: 1, fontFamily: '"Space Grotesk",sans-serif', fontSize: '12px', fontWeight: 600,
                      background: newGameMode === key ? 'var(--accent)' : 'var(--panel2)',
                      color: newGameMode === key ? '#0f1a14' : 'var(--ink)',
                      border: `1px solid ${newGameMode === key ? 'var(--accent)' : 'var(--line)'}`,
                      borderRadius: '9px', padding: '8px 4px', cursor: onlineWaitId ? 'default' : 'pointer',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* time control picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setSelectedTc(0)}
                style={{
                  fontFamily: '"Space Grotesk",sans-serif', fontSize: '13px', fontWeight: 600,
                  background: selectedTc === 0 ? 'var(--accent)' : 'var(--panel2)',
                  color: selectedTc === 0 ? '#0f1a14' : 'var(--ink)',
                  border: `1px solid ${selectedTc === 0 ? 'var(--accent)' : 'var(--line)'}`,
                  borderRadius: '10px', padding: '9px 14px', cursor: 'pointer', textAlign: 'left',
                  opacity: onlineWaitId ? .5 : 1,
                }}
              >
                ∞ Sem tempo
              </button>

              {(['Bala', 'Blitz', 'Rápido', 'Clássico'] as const).map(cat => {
                const items = TIME_CONTROLS.map((tc, i) => ({ ...tc, i })).filter(tc => tc.cat === cat)
                return (
                  <div key={cat}>
                    <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '9px', letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>{cat}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {items.map(({ label, i }) => (
                        <button
                          key={i}
                          onClick={() => { if (!onlineWaitId) setSelectedTc(i) }}
                          style={{
                            fontFamily: '"Space Grotesk",sans-serif', fontSize: '12px', fontWeight: 600,
                            background: selectedTc === i ? 'var(--accent)' : 'var(--panel2)',
                            color: selectedTc === i ? '#0f1a14' : 'var(--ink)',
                            border: `1px solid ${selectedTc === i ? 'var(--accent)' : 'var(--line)'}`,
                            borderRadius: '9px', padding: '7px 12px', cursor: onlineWaitId ? 'default' : 'pointer',
                            opacity: onlineWaitId ? .5 : 1,
                          }}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* action area */}
            {newGameMode !== 'online' ? (
              <button
                onClick={() => {
                  if (newGameMode === 'ai') {
                    navigate('/play')
                    startNewGame()
                  } else {
                    navigate('/play?mode=local')
                    startNewGame()
                  }
                }}
                style={{
                  fontFamily: '"Space Mono",monospace', background: 'var(--accent)', color: '#0f1a14',
                  border: 'none', borderRadius: '10px', padding: '12px 0', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', width: '100%',
                }}
              >
                Iniciar
              </button>
            ) : onlineWaitId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '12px', color: 'var(--muted)' }}>
                  Aguardando oponente...
                </div>
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button
                    onClick={() => navigate('/')}
                    style={{ flex: 1, fontFamily: '"Space Mono",monospace', fontSize: '12px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}
                  >
                    Ver lobby
                  </button>
                  <button
                    onClick={() => { cancelOnlineChallenge(); setShowNewGame(false) }}
                    style={{ flex: 1, fontFamily: '"Space Mono",monospace', fontSize: '12px', background: 'var(--panel2)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={createOnlineChallenge}
                style={{
                  fontFamily: '"Space Mono",monospace', background: 'var(--accent)', color: '#0f1a14',
                  border: 'none', borderRadius: '10px', padding: '12px 0', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', width: '100%',
                }}
              >
                Criar desafio online
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── settings panel ── */}
      {showSettings && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,10,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}
          onClick={e => { if (e.target === e.currentTarget) setShowSettings(false) }}
        >
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '18px', padding: '22px 24px', width: 'min(92vw,340px)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '16px' }}>Configurações</span>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '2px 6px' }}>×</button>
            </div>

            {/* piece set */}
            <div>
              <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Peças</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(['cls', 'flt', 'got', 'min', 'geo', 'kan', 'sam', 'oli', 'com', 'msk'] as PieceSet[]).map(s => (
                  <button
                    key={s}
                    onClick={() => dispatch({ type: 'SET_SET', set: s })}
                    style={{
                      flex: '1 1 calc(25% - 6px)', fontFamily: '"Space Grotesk",sans-serif', fontSize: '11px', fontWeight: 600,
                      background: settings.set === s ? 'var(--accent)' : 'var(--panel2)',
                      color: settings.set === s ? '#0f1a14' : 'var(--ink)',
                      border: `1px solid ${settings.set === s ? 'var(--accent)' : 'var(--line)'}`,
                      borderRadius: '9px', padding: '8px 4px', cursor: 'pointer',
                    }}
                  >
                    {s === 'cls' ? 'Clássico' : s === 'flt' ? 'Flat' : s === 'neo' ? 'Neo' : s === 'got' ? 'Gótico'
                      : s === 'min' ? 'Minimal' : s === 'geo' ? 'Geo' : s === 'kan' ? '漢字'
                      : s === 'sam' ? 'Samsonadzes' : s === 'oli' ? 'Olimpo' : s === 'com' ? 'Commedia' : 'Máscaras'}
                  </button>
                ))}
              </div>
            </div>

            {/* board theme */}
            <div>
              <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Cor do Tabuleiro</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                {(Object.keys(THEMES) as BoardTheme[]).map(t => (
                  <button
                    key={t}
                    onClick={() => dispatch({ type: 'SET_THEME', theme: t })}
                    title={THEME_LABELS[t]}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      borderRadius: '8px', outline: settings.theme === t ? `2px solid var(--accent)` : 'none',
                    }}
                  >
                    <div style={{
                      width: '52px', height: '34px', borderRadius: '6px', overflow: 'hidden',
                      background: `linear-gradient(135deg, ${THEMES[t].sqL} 50%, ${THEMES[t].sqD} 50%)`,
                      border: `2px solid ${settings.theme === t ? 'var(--accent)' : 'var(--line)'}`,
                    }} />
                    <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: '10px', color: settings.theme === t ? 'var(--ink)' : 'var(--muted)' }}>
                      {THEME_LABELS[t]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* squares */}
            <div>
              <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Casas</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {([false, true] as const).map(alt => (
                  <button
                    key={String(alt)}
                    onClick={() => { if (settings.alt !== alt) dispatch({ type: 'TOGGLE_ALT' }) }}
                    style={{
                      flex: 1, fontFamily: '"Space Grotesk",sans-serif', fontSize: '12px', fontWeight: 600,
                      background: settings.alt === alt ? 'var(--accent)' : 'var(--panel2)',
                      color: settings.alt === alt ? '#0f1a14' : 'var(--ink)',
                      border: `1px solid ${settings.alt === alt ? 'var(--accent)' : 'var(--line)'}`,
                      borderRadius: '9px', padding: '8px 4px', cursor: 'pointer',
                    }}
                  >
                    {alt ? 'Alternadas' : 'Lisas'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── floating drag piece ── */}
      {drag && (
        <div
          ref={dragFloatEl}
          style={{
            position: 'fixed',
            left: 0, top: 0,
            width: drag.cellSizePx,
            height: drag.cellSizePx,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 200,
            display: 'none',
            filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.6))',
          }}
        >
          <PieceSVG cell={drag.cell} set={settings.set} size={`${drag.cellSizePx}px`} noFlip={drag.kind === 'hand'} />
        </div>
      )}

      {/* ── promotion modal ── */}
      {pendingPromo && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,12,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}
          onClick={e => { if (e.target === e.currentTarget) resolvePromo(false) }}
        >
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '16px', padding: '22px', width: 'min(86vw,330px)', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,.5)' }}>
            <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', margin: '0 0 4px', fontSize: '19px' }}>Promover?</h3>
            <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '13.5px' }}>A peça entrou na zona de promoção.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {[true, false].map(promote => (
                <div
                  key={String(promote)}
                  onClick={() => resolvePromo(promote)}
                  style={{
                    background: 'var(--panel2)', border: `1px solid ${promote ? 'var(--accent)' : 'var(--line)'}`,
                    borderRadius: '12px', padding: '10px', cursor: 'pointer', width: '104px',
                  }}
                >
                  <div style={{ width: '54px', height: '60px', margin: '0 auto 6px' }}>
                    <PieceSVG cell={{ ...pendingPromo.cell, p: promote }} set={settings.set} size="54px" noFlip />
                  </div>
                  <span style={{ fontSize: '12px', fontFamily: '"Space Mono",monospace', color: 'var(--muted)' }}>
                    {promote ? 'Promover' : 'Manter'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── game over banner ── */}
      {gameOver && (() => {
        const winner: Owner = clockWinner ?? status.winner ?? 'l'
        const isLight = winner === 'l'
        const accentCol = isLight ? '#d4a830' : '#8b5cf6'
        const glowCol   = isLight ? 'rgba(212,168,48,.50)' : 'rgba(139,92,246,.42)'
        const byTimeout = !!clockWinner && !status.over
        const headline  = byTimeout ? 'Tempo esgotado!' : status.mate ? 'Xeque-mate!' : 'Vitória!'
        const sublabel  = `${OWNER_LABEL[winner]} venceu a partida`
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,.84)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{
              background: 'var(--panel)', borderRadius: '22px', width: 'min(88vw,310px)', textAlign: 'center',
              boxShadow: `0 28px 70px rgba(0,0,0,.65), 0 0 0 1px var(--line), inset 0 1px 0 rgba(255,255,255,.06)`,
              overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              {/* colour accent strip */}
              <div style={{ height: '4px', width: '100%', background: `linear-gradient(90deg, transparent, ${accentCol}, transparent)` }} />

              <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                {/* glow ring + piece */}
                <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${glowCol} 0%, transparent 70%)` }} />
                  <span style={{ position: 'absolute', top: 4,  left: 18,  fontSize: '13px', color: accentCol, opacity: .9 }}>✦</span>
                  <span style={{ position: 'absolute', top: 10, right: 14, fontSize: '9px',  color: accentCol, opacity: .7 }}>✦</span>
                  <span style={{ position: 'absolute', bottom: 6, left: 10,  fontSize: '9px',  color: accentCol, opacity: .7 }}>✦</span>
                  <span style={{ position: 'absolute', bottom: 2, right: 18, fontSize: '13px', color: accentCol, opacity: .9 }}>✦</span>
                  <div style={{ position: 'relative', width: '88px', height: '88px' }}>
                    <PieceSVG cell={{ t: 'K', o: winner, p: false }} set={settings.set} fill noFlip />
                  </div>
                </div>

                {/* headline */}
                <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: '30px', letterSpacing: '-.02em', lineHeight: 1, color: accentCol, marginBottom: '6px' }}>
                  {headline}
                </div>

                {/* sub-label — one line, no break */}
                <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: '14px', color: 'var(--muted)', marginBottom: '26px', whiteSpace: 'nowrap' }}>
                  {sublabel}
                </div>

                <button
                  onClick={() => { openNewGame() }}
                  style={{
                    fontFamily: '"Space Mono",monospace', background: 'var(--accent)', color: '#0f1a14',
                    border: 'none', borderRadius: '10px', padding: '11px 0', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', width: '100%',
                  }}
                >
                  Novo jogo
                </button>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}

/* ─── HandPanel ─── */
function HandPanel({
  owner, state, sel, set, onChip, onChipPointerDown,
}: {
  owner: Owner
  state: GameState
  sel: SelectionKind | null
  set: PieceSet
  onChip: (owner: Owner, type: HandType) => void
  onChipPointerDown: (e: React.PointerEvent<HTMLDivElement>, owner: Owner, type: HandType) => void
}) {
  const counts = state.hands[owner]
  const isActive = owner === state.turn
  const LABEL: Record<Owner, string> = { l: 'Claro', d: 'Escuro' }

  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px',
      padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '62px',
    }}>
      <div style={{
        fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, width: '78px',
      }}>
        <span style={{ width: '11px', height: '11px', borderRadius: '50%', border: '1.5px solid var(--line)', background: owner === 'l' ? '#f1e6d0' : '#16130f', display: 'inline-block' }} />
        {LABEL[owner]}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
        {HAND_TYPES.filter(t => counts[t] > 0).length === 0
          ? <span style={{ fontSize: '12px', color: 'var(--muted)', opacity: .6, fontStyle: 'italic' }}>mão vazia</span>
          : HAND_TYPES.filter(t => counts[t] > 0).map(t => {
            const isSelected = sel?.kind === 'hand' && sel.owner === owner && sel.type === t
            return (
              <div
                key={t}
                onClick={() => isActive && onChip(owner, t)}
                onPointerDown={(e) => isActive && onChipPointerDown(e, owner, t)}
                style={{
                  position: 'relative', width: '40px', height: '44px', borderRadius: '8px',
                  background: 'var(--panel2)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--line)'}`,
                  boxShadow: isSelected ? '0 0 0 2px var(--accent)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isActive ? 'grab' : 'default',
                  touchAction: 'none', userSelect: 'none',
                }}
              >
                <PieceSVG cell={{ t, o: owner, p: false }} set={set} size="32px" noFlip />
                <span style={{
                  position: 'absolute', right: '-4px', bottom: '-5px', background: 'var(--ink)', color: '#241f1a',
                  fontFamily: '"Space Mono",monospace', fontSize: '10px', fontWeight: 700,
                  borderRadius: '9px', padding: '0 4px', minWidth: '15px', textAlign: 'center',
                }}>
                  {counts[t]}
                </span>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

/* ─── One move cell (icon + text) inside a paired turn row ─── */
function MoveCell({ entry, set }: { entry: HistoryEntry; set: PieceSet }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
      <span style={{ width: '15px', height: '15px', display: 'inline-flex', background: '#d8bd8c', borderRadius: '2px', flexShrink: 0 }}>
        <PieceSVG cell={entry.cell} set={set} size="15px" noFlip />
      </span>
      <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '9px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.text}
      </span>
    </div>
  )
}

/* ─── MoveHistoryItems — paired turns like Chess.com ─── */
function MoveHistoryItems({ entries, set }: { entries: HistoryEntry[]; set: PieceSet }) {
  if (entries.length === 0) {
    return (
      <span style={{ fontSize: '10px', color: 'var(--muted)', opacity: .6, fontStyle: 'italic', padding: '4px 6px' }}>
        Nenhum lance ainda.
      </span>
    )
  }
  // Group into paired turns: entries[0,1] = turn 1, entries[2,3] = turn 2, etc.
  const turns: Array<{ num: number; light: HistoryEntry; dark?: HistoryEntry }> = []
  for (let i = 0; i < entries.length; i += 2) {
    turns.push({ num: Math.floor(i / 2) + 1, light: entries[i], dark: entries[i + 1] })
  }
  return (
    <>
      {turns.map(({ num, light, dark }) => {
        const isLast = num === turns.length
        return (
          <div
            key={num}
            style={{
              display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 4px', borderRadius: '4px',
              background: isLast ? 'var(--panel2)' : 'transparent',
            }}
          >
            <span style={{
              fontFamily: '"Space Mono",monospace', fontSize: '9px', color: 'var(--muted)',
              minWidth: '16px', textAlign: 'right', flexShrink: 0,
            }}>
              {num}.
            </span>
            <MoveCell entry={light} set={set} />
            {dark
              ? <MoveCell entry={dark} set={set} />
              : <div style={{ flex: 1 }} />
            }
          </div>
        )
      })}
    </>
  )
}

/* ─── MoveHistory — wraps items in a scrollable container (mobile use) ─── */
function MoveHistory({ entries, set, elRef, maxH }: {
  entries: HistoryEntry[]
  set: PieceSet
  elRef: React.Ref<HTMLDivElement>
  maxH?: string
}) {
  return (
    <div
      ref={elRef}
      style={{
        background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px',
        padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: '1px',
        maxHeight: maxH ?? '96px', overflowY: 'auto',
      }}
    >
      <MoveHistoryItems entries={entries} set={set} />
    </div>
  )
}
