import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PieceDefs from '../components/PieceDefs'
import PieceSVG from '../components/PieceSVG'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Cell, GameState, HandType, Owner, SelectionKind, Target } from '../lib/types'
import type { PieceSet } from '../lib/types'
import { HAND_TYPES, apply, canPromote, gameStatus, inCheck, legalDrops, legalTargetsFrom, mustPromote, opp } from '../lib/engine'
import { coord } from '../lib/pieces'
import { loadSettings } from '../lib/storage'
import { sounds } from '../lib/sounds'
import { THEMES } from '../lib/themes'

/* ── helpers ── */
function formatMs(ms: number): string {
  if (ms <= 0) return '0:00'
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ── DB row type ── */
interface GameRow {
  id: string
  light_id: string
  dark_id: string
  state_json: GameState
  notation_json: { cell: Cell; text: string }[]
  time_control_secs: number | null
  time_control_inc: number | null
  clock_light_ms: number | null
  clock_dark_ms: number | null
  last_move_at: string | null
  status: string
  winner: string | null
  light_profile: { username: string; rating: number }
  dark_profile: { username: string; rating: number }
}

const GAME_QUERY = `
  *,
  light_profile:profiles!games_light_id_fkey(username, rating),
  dark_profile:profiles!games_dark_id_fkey(username, rating)
`

export default function OnlineGame() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const settings = { ...{ set: 'cls' as PieceSet, theme: 'wood' as const, alt: true }, ...loadSettings() }
  const theme = THEMES[settings.theme]

  const [game, setGame] = useState<GameRow | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [sel, setSel] = useState<SelectionKind | null>(null)
  const [pendingPromo, setPendingPromo] = useState<{ fr: number; fc: number; tr: number; tc: number; cell: Cell } | null>(null)
  const [lastMove, setLastMove] = useState<{ from?: { r: number; c: number }; to: { r: number; c: number } } | null>(null)
  const [clockDisplay, setClockDisplay] = useState<{ l: number; d: number }>({ l: 0, d: 0 })
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const gameRef = useRef<GameRow | null>(null)
  const stateRef = useRef<GameState | null>(null)
  gameRef.current = game
  stateRef.current = state

  /* ── determine local player's color ── */
  const myColor: Owner | null = game
    ? (game.light_id === user?.id ? 'l' : game.dark_id === user?.id ? 'd' : null)
    : null

  /* ── load game ── */
  useEffect(() => {
    if (!id) return
    supabase
      .from('games')
      .select(GAME_QUERY)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setErrorMsg('Partida não encontrada.'); return }
        const g = data as GameRow
        setGame(g)
        setState(g.state_json)
        initClocks(g)
      })
  }, [id])

  function initClocks(g: GameRow) {
    if (!g.clock_light_ms) return
    setClockDisplay({ l: g.clock_light_ms, d: g.clock_dark_ms ?? 0 })
  }

  /* ── realtime subscription ── */
  useEffect(() => {
    if (!id) return
    const ch = supabase.channel(`game-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}` },
        (payload) => {
          const g = payload.new as GameRow
          setGame(g)
          setState(g.state_json)
          initClocks(g)
          sounds.move()
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [id])

  /* ── clock tick ── */
  useEffect(() => {
    const g = gameRef.current
    if (!g?.clock_light_ms || !g.last_move_at) return
    const tick = setInterval(() => {
      const elapsed = Date.now() - new Date(g.last_move_at!).getTime()
      const cur = stateRef.current
      if (!cur) return
      if (cur.turn === 'l') {
        setClockDisplay(c => ({ ...c, l: Math.max(0, (g.clock_light_ms ?? 0) - elapsed) }))
      } else {
        setClockDisplay(c => ({ ...c, d: Math.max(0, (g.clock_dark_ms ?? 0) - elapsed) }))
      }
    }, 500)
    return () => clearInterval(tick)
  }, [game?.id, game?.last_move_at, game?.state_json])

  /* ── interaction ── */
  const isMyTurn = state && myColor && state.turn === myColor && game?.status !== 'finished'

  function targetAt(r: number, c: number): Target | undefined {
    return sel?.targets.find(t => t.r === r && t.c === c)
  }

  function visualToLogical(r: number, c: number): { r: number; c: number } {
    if (myColor === 'd') return { r: 8 - r, c: 8 - c }
    return { r, c }
  }

  const handleSquare = useCallback((vr: number, vc: number) => {
    if (!isMyTurn || !state || pendingPromo) return
    const { r, c } = visualToLogical(vr, vc)
    if (sel) {
      const t = targetAt(r, c)
      if (t) {
        if (sel.kind === 'board') {
          const cell = state.board[sel.r][sel.c]!
          if (mustPromote(cell, r)) {
            doMove(sel.r, sel.c, r, c, true, cell)
          } else if (canPromote(cell, sel.r, r)) {
            setPendingPromo({ fr: sel.r, fc: sel.c, tr: r, tc: c, cell })
            setSel(null)
          } else {
            doMove(sel.r, sel.c, r, c, false, cell)
          }
        } else {
          doDrop(sel.type, r, c)
        }
        return
      }
    }
    const cell = state.board[r][c]
    if (cell && cell.o === state.turn) {
      const targets = legalTargetsFrom(state, r, c)
      setSel({ kind: 'board', r, c, targets })
    } else {
      setSel(null)
    }
  }, [sel, state, isMyTurn, pendingPromo]) // eslint-disable-line

  function handleHand(htype: HandType) {
    if (!isMyTurn || !state) return
    if (sel?.kind === 'hand' && sel.type === htype) { setSel(null); return }
    const targets = legalDrops(state, htype)
    setSel({ kind: 'hand', owner: myColor!, type: htype, targets })
  }

  function resolvePromo(promote: boolean) {
    if (!pendingPromo) return
    doMove(pendingPromo.fr, pendingPromo.fc, pendingPromo.tr, pendingPromo.tc, promote, pendingPromo.cell)
    setPendingPromo(null)
  }

  async function doMove(fr: number, fc: number, tr: number, tc: number, promote: boolean, cell: Cell) {
    if (!state || !game) return
    setSel(null)
    const cap = !!state.board[tr][tc]
    const mv = { from: { r: fr, c: fc }, to: { r: tr, c: tc }, promote }
    const next = apply(state, mv)
    const notationText = coord(tr, tc) + (cap ? '×' : '') + (promote ? '+' : '')
    await saveMove(next, { cell, text: notationText }, fr, fc, tr, tc)
  }

  async function doDrop(htype: HandType, r: number, c: number) {
    if (!state || !game) return
    setSel(null)
    const mv = { drop: htype, to: { r, c } }
    const next = apply(state, mv)
    const notationText = coord(r, c)
    await saveMove(next, { cell: { t: htype, o: myColor!, p: false }, text: `*${notationText}` })
  }

  async function saveMove(
    next: GameState,
    notationEntry: { cell: Cell; text: string },
    fr?: number, fc?: number, tr?: number, tc?: number
  ) {
    if (!game) return
    setSaving(true)
    const status = gameStatus(next)

    const now = Date.now()
    const elapsed = game.last_move_at ? now - new Date(game.last_move_at).getTime() : 0
    const inc = (game.time_control_inc ?? 0) * 1000

    let clockLightMs = game.clock_light_ms
    let clockDarkMs  = game.clock_dark_ms
    if (clockLightMs !== null && clockDarkMs !== null) {
      if (myColor === 'l') clockLightMs = Math.max(0, clockLightMs - elapsed) + inc
      else                  clockDarkMs  = Math.max(0, clockDarkMs  - elapsed) + inc
    }

    const newNotation = [...(game.notation_json ?? []), notationEntry]
    const { error } = await supabase.from('games').update({
      state_json: next,
      notation_json: newNotation,
      clock_light_ms: clockLightMs,
      clock_dark_ms:  clockDarkMs,
      last_move_at:   clockLightMs !== null ? new Date(now).toISOString() : null,
      winner:  status.over ? (status.winner ?? null) : undefined,
      status: status.over ? 'finished' : 'active',
    }).eq('id', game.id)

    if (error) setErrorMsg('Erro ao salvar jogada.')
    else {
      setState(next)
      if (fr !== undefined && tr !== undefined)
        setLastMove({ from: { r: fr, c: fc! }, to: { r: tr, c: tc! } })
      if (status.over) {
        sounds.gameOver()
        triggerElo(game.id, status.winner ?? 'draw')
      } else if (inCheck(next, next.turn)) {
        sounds.check()
      } else {
        sounds.move()
      }
    }
    setSaving(false)
  }

  async function triggerElo(gameId: string, winner: Owner | 'draw') {
    await supabase.functions.invoke('update-ratings', { body: { game_id: gameId, winner } })
  }

  async function resign() {
    if (!game || !myColor) return
    const winner = opp(myColor)
    await supabase.from('games').update({ winner, win_reason: 'resign', status: 'finished' }).eq('id', game.id)
    await triggerElo(game.id, winner)
  }

  /* ── board render ── */
  if (errorMsg) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontFamily: '"Space Mono",monospace', color: 'var(--warn)' }}>{errorMsg}</div>
      <button onClick={() => navigate('/')} style={ghostBtn}>← Lobby</button>
    </div>
  )

  if (!game || !state) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Mono",monospace', fontSize: '13px', color: 'var(--muted)' }}>
      carregando...
    </div>
  )

  const over = game.status === 'finished'

  function renderBoard() {
    const rows = myColor === 'd'
      ? Array.from({ length: 9 }, (_, i) => 8 - i)
      : Array.from({ length: 9 }, (_, i) => i)
    const cols = myColor === 'd'
      ? Array.from({ length: 9 }, (_, i) => 8 - i)
      : Array.from({ length: 9 }, (_, i) => i)

    return rows.map((r, vr) => cols.map((c, vc) => {
      const cell = state!.board[r][c]
      const isSelected = sel?.kind === 'board' && sel.r === r && sel.c === c
      const t = targetAt(r, c)
      const isLastFrom = lastMove?.from?.r === r && lastMove?.from?.c === c
      const isLastTo   = lastMove?.to.r === r && lastMove?.to.c === c
      const inChk = cell?.t === 'K' && inCheck(state!, cell.o) && !over

      const isLight = (r + c) % 2 === 1
      const bg = inChk ? theme.checkSq
        : isSelected ? theme.selSq
        : isLastFrom || isLastTo ? theme.lastMove
        : isLight ? theme.sqL : theme.sqD

      return (
        <div
          key={`${r},${c}`}
          onClick={() => handleSquare(vr, vc)}
          style={{
            position: 'relative',
            background: bg,
            cursor: isMyTurn && !over ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* drop target dot */}
          {t && !cell && (
            <div style={{
              position: 'absolute', width: '30%', height: '30%', borderRadius: '50%',
              background: 'rgba(212,168,48,.7)', pointerEvents: 'none',
            }} />
          )}
          {/* capture ring */}
          {t && cell && (
            <div style={{
              position: 'absolute', inset: '3px', borderRadius: '50%',
              border: '2px solid rgba(212,168,48,.8)', pointerEvents: 'none',
            }} />
          )}
          {cell && <PieceSVG cell={cell} set={settings.set} fill />}
        </div>
      )
    }))
  }

  const lightLabel = game.light_profile?.username ?? 'Claro'
  const darkLabel  = game.dark_profile?.username  ?? 'Escuro'
  const topLabel   = myColor === 'd' ? lightLabel : darkLabel
  const botLabel   = myColor === 'd' ? darkLabel  : lightLabel
  const topOwner: Owner = myColor === 'd' ? 'l' : 'd'
  const botOwner: Owner = myColor === 'd' ? 'd' : 'l'
  const topClockMs = topOwner === 'l' ? clockDisplay.l : clockDisplay.d
  const botClockMs = botOwner === 'l' ? clockDisplay.l : clockDisplay.d

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <PieceDefs />

      {/* header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <button onClick={() => navigate('/')} style={ghostBtn}>← Lobby</button>
        <div style={{ flex: 1, fontFamily: '"Space Mono",monospace', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
          {game.time_control_secs
            ? `${Math.floor(game.time_control_secs / 60)}${game.time_control_inc ? `+${game.time_control_inc}` : ' min'}`
            : 'Sem tempo'}
          {saving && <span style={{ marginLeft: '8px', opacity: .6 }}>...</span>}
        </div>
        {!over && myColor && (
          <button onClick={resign} style={{ ...ghostBtn, color: 'var(--warn)', borderColor: 'var(--warn)' }}>Render</button>
        )}
      </header>

      {/* opponent hand (top) */}
      <div style={{ padding: '8px 12px 4px' }}>
        <OnlineHandPanel owner={topOwner} state={state} isMe={false} label={topLabel} clockMs={topClockMs} hasClock={!!game.clock_light_ms} activeTurn={state.turn === topOwner && !over} settings={settings} onChip={() => {}} />
      </div>

      {/* board */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', minHeight: 0 }}>
        <div style={{ position: 'relative', aspectRatio: '1', maxWidth: 'min(96vw, 96vh - 200px)', width: '100%' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gridTemplateRows: 'repeat(9, 1fr)',
            width: '100%', height: '100%',
            background: theme.frame, borderRadius: '8px', padding: '4px', gap: '1px',
            boxShadow: '0 8px 24px rgba(0,0,0,.4)',
          }}>
            {renderBoard()}
          </div>

          {/* promotion dialog */}
          {pendingPromo && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <div style={{ background: 'var(--panel)', borderRadius: '14px', padding: '20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '12px', color: 'var(--muted)' }}>Promover?</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[true, false].map(p => (
                    <button key={String(p)} onClick={() => resolvePromo(p)} style={{ width: '54px', height: '60px', background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: '10px', cursor: 'pointer', position: 'relative' }}>
                      <PieceSVG cell={{ ...pendingPromo.cell, p }} set={settings.set} fill noFlip />
                    </button>
                  ))}
                </div>
                <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>
                  {pendingPromo.cell.t} → sim / não
                </div>
              </div>
            </div>
          )}

          {/* game over overlay */}
          {over && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <div style={{ background: 'var(--panel)', borderRadius: '16px', padding: '28px 36px', textAlign: 'center' }}>
                <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: '26px', color: 'var(--accent)', marginBottom: '6px' }}>
                  {!game.winner ? 'Empate' : game.winner === myColor ? 'Vitória!' : 'Derrota'}
                </div>
                <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '12px', color: 'var(--muted)', marginBottom: '20px' }}>
                  {!game.winner ? '½ - ½' : `${game.winner === 'l' ? lightLabel : darkLabel} venceu`}
                </div>
                <button onClick={() => navigate('/')} style={{ ...ghostBtn, width: '100%' }}>← Lobby</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* my hand (bottom) */}
      <div style={{ padding: '4px 12px 8px' }}>
        <OnlineHandPanel owner={botOwner} state={state} isMe={!!myColor} label={botLabel} clockMs={botClockMs} hasClock={!!game.clock_light_ms} activeTurn={state.turn === botOwner && !over} settings={settings} onChip={handleHand} />
      </div>
    </div>
  )
}

/* ── hand panel ── */
function OnlineHandPanel({
  owner, state, isMe, label, clockMs, hasClock, activeTurn, settings, onChip,
}: {
  owner: Owner, state: GameState, isMe: boolean, label: string, clockMs: number, hasClock: boolean,
  activeTurn: boolean, settings: { set: PieceSet }, onChip: (t: HandType) => void,
}) {
  const counts = state.hands[owner]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: 'var(--panel)', border: `1px solid ${activeTurn ? 'var(--accent)' : 'var(--line)'}`, borderRadius: '10px', transition: 'border-color .2s' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '70px' }}>
        <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '11px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {hasClock && (
          <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '16px', fontWeight: 700, color: clockMs < 30_000 ? 'var(--warn)' : 'var(--ink)', lineHeight: 1 }}>
            {formatMs(clockMs)}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', flex: 1 }}>
        {HAND_TYPES.filter(t => counts[t] > 0).map(t => (
          <div
            key={t}
            onClick={() => isMe && activeTurn && onChip(t)}
            style={{
              position: 'relative', width: '36px', height: '40px', borderRadius: '7px',
              background: 'var(--panel2)', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isMe && activeTurn ? 'pointer' : 'default',
            }}
          >
            <PieceSVG cell={{ t, o: owner, p: false }} set={settings.set} size="28px" noFlip />
            <span style={{
              position: 'absolute', right: '-4px', bottom: '-5px',
              background: 'var(--ink)', color: '#1a1a1a',
              fontFamily: '"Space Mono",monospace', fontWeight: 700, fontSize: '9px',
              borderRadius: '4px', padding: '1px 3px', lineHeight: 1,
            }}>{counts[t]}</span>
          </div>
        ))}
        {HAND_TYPES.every(t => !counts[t]) && (
          <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '11px', color: 'var(--muted)', opacity: .6, fontStyle: 'italic' }}>vazia</span>
        )}
      </div>
    </div>
  )
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)',
  borderRadius: '8px', padding: '6px 10px', fontFamily: '"Space Mono",monospace',
  fontSize: '11px', cursor: 'pointer',
}
