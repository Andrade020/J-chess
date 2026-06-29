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
  last_move_json: { from?: { r: number; c: number }; to: { r: number; c: number } } | null
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
        if (g.last_move_json) setLastMove(g.last_move_json)
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
          if (g.last_move_json) setLastMove(g.last_move_json)
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
    await saveMove(next, { cell, text: notationText }, { from: { r: fr, c: fc }, to: { r: tr, c: tc } })
  }

  async function doDrop(htype: HandType, r: number, c: number) {
    if (!state || !game) return
    setSel(null)
    const mv = { drop: htype, to: { r, c } }
    const next = apply(state, mv)
    const notationText = coord(r, c)
    await saveMove(next, { cell: { t: htype, o: myColor!, p: false }, text: `*${notationText}` }, { to: { r, c } })
  }

  async function saveMove(
    next: GameState,
    notationEntry: { cell: Cell; text: string },
    lm?: { from?: { r: number; c: number }; to: { r: number; c: number } }
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
      last_move_json: lm ?? null,
      clock_light_ms: clockLightMs,
      clock_dark_ms:  clockDarkMs,
      last_move_at:   clockLightMs !== null ? new Date(now).toISOString() : null,
      winner:  status.over ? (status.winner ?? null) : undefined,
      status: status.over ? 'finished' : 'active',
    }).eq('id', game.id)

    if (error) setErrorMsg('Erro ao salvar jogada.')
    else {
      setState(next)
      if (lm) setLastMove(lm)
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

      let bg = settings.alt ? (isLight ? theme.sqL : theme.sqD) : theme.sq
      if (isSelected) bg = theme.selSq
      if (inChk) bg = theme.checkSq

      return (
        <div
          key={`${vr},${vc}`}
          onClick={() => handleSquare(vr, vc)}
          style={{
            position: 'relative',
            background: bg,
            borderRight:  vc < 8 ? '1px solid rgba(58,42,20,.35)' : 'none',
            borderBottom: vr < 8 ? '1px solid rgba(58,42,20,.35)' : 'none',
            cursor: isMyTurn && !over ? 'pointer' : 'default',
            overflow: 'hidden',
          }}
        >
          {/* last move highlight */}
          {(isLastFrom || isLastTo) && (
            <div style={{ position: 'absolute', inset: 0, background: theme.lastMove, pointerEvents: 'none' }} />
          )}
          {cell && (
            <div style={{ position: 'absolute', inset: 0 }}>
              <PieceSVG cell={cell} set={settings.set} fill />
            </div>
          )}
          {/* drop target dot */}
          {t && !cell && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)', width: '28%', height: '28%',
              borderRadius: '50%', background: theme.tgt, pointerEvents: 'none',
            }} />
          )}
          {/* capture ring */}
          {t && cell && (
            <div style={{
              position: 'absolute', inset: '5%', borderRadius: '50%',
              border: `4px solid ${theme.tgt}`, pointerEvents: 'none',
            }} />
          )}
        </div>
      )
    }))
  }

  const lightLabel = game.light_profile?.username ?? 'Claro'
  const darkLabel  = game.dark_profile?.username  ?? 'Escuro'
  const topOwner: Owner = myColor === 'd' ? 'l' : 'd'
  const botOwner: Owner = myColor === 'd' ? 'd' : 'l'
  const topLabel   = topOwner === 'l' ? lightLabel : darkLabel
  const botLabel   = botOwner === 'l' ? lightLabel : darkLabel
  const topClockMs = topOwner === 'l' ? clockDisplay.l : clockDisplay.d
  const botClockMs = botOwner === 'l' ? clockDisplay.l : clockDisplay.d
  const hasClock   = !!game.clock_light_ms
  const opponentName = myColor === 'l' ? darkLabel : lightLabel
  const winnerName   = !game.winner ? null : game.winner === 'l' ? lightLabel : darkLabel
  const tcStr = game.time_control_secs
    ? `${Math.floor(game.time_control_secs / 60)}${game.time_control_inc ? `+${game.time_control_inc}` : ' min'}`
    : 'Sem tempo'

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <PieceDefs />

      {/* header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <button onClick={() => navigate('/')} style={ghostBtn}>← Lobby</button>
        <div style={{ flex: 1, fontFamily: '"Space Mono",monospace', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
          vs <b style={{ color: 'var(--ink)' }}>{opponentName}</b>
          <span style={{ marginLeft: '8px', opacity: .6 }}>{tcStr}</span>
          {saving && <span style={{ marginLeft: '8px', opacity: .5 }}>...</span>}
          {inCheck(state, state.turn) && !over && <span style={{ marginLeft: '8px', color: 'var(--warn)', fontWeight: 700 }}>Xeque!</span>}
        </div>
        {!over && myColor && (
          <button onClick={resign} style={{ ...ghostBtn, color: 'var(--warn)', borderColor: 'var(--warn)' }}>Desistir</button>
        )}
      </header>

      {/* body: game + notation panel */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* center: hands + board */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px', gap: '6px', minWidth: 0 }}>

          {/* opponent hand */}
          <div style={{ width: '100%', maxWidth: '680px' }}>
            <OnlineHandPanel owner={topOwner} state={state} isMe={false} label={topLabel} clockMs={topClockMs} hasClock={hasClock} activeTurn={state.turn === topOwner && !over} settings={settings} onChip={() => {}} />
          </div>

          {/* board */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '680px', minHeight: 0 }}>
            <div style={{ position: 'relative', aspectRatio: '1', maxWidth: 'min(100%, calc(100vh - 220px))', width: '100%' }}>
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                background: theme.frame, borderRadius: '8px',
                padding: '8px 8px 20px 20px',
                boxShadow: '0 8px 24px rgba(0,0,0,.4)',
              }}>
                {/* rank labels */}
                <div style={{ position: 'absolute', left: 0, top: '8px', bottom: '20px', width: '20px', display: 'flex', flexDirection: 'column' }}>
                  {(myColor === 'd'
                    ? Array.from({ length: 9 }, (_, i) => i + 1)
                    : Array.from({ length: 9 }, (_, i) => 9 - i)
                  ).map(n => (
                    <span key={n} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Mono",monospace', fontSize: '9px', color: theme.label, opacity: .72 }}>{n}</span>
                  ))}
                </div>
                {/* file labels */}
                <div style={{ position: 'absolute', left: '20px', right: '8px', bottom: 0, height: '20px', display: 'flex' }}>
                  {(myColor === 'd' ? 'IHGFEDCBA' : 'ABCDEFGHI').split('').map(l => (
                    <span key={l} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Mono",monospace', fontSize: '9px', color: theme.label, opacity: .72 }}>{l}</span>
                  ))}
                </div>
                {/* board grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gridTemplateRows: 'repeat(9, 1fr)',
                  width: '100%', height: '100%',
                  border: `1.5px solid ${theme.gridBorder}`,
                  borderRadius: '4px', overflow: 'hidden',
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
                    <div style={{ background: 'var(--panel)', borderRadius: '16px', padding: '28px 36px', textAlign: 'center', minWidth: '200px' }}>
                      <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: '26px', color: 'var(--accent)', marginBottom: '6px' }}>
                        {!game.winner ? 'Empate' : game.winner === myColor ? 'Você venceu!' : `${winnerName} venceu`}
                      </div>
                      <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '12px', color: 'var(--muted)', marginBottom: '20px' }}>
                        {!game.winner ? '½ - ½' : `${lightLabel} × ${darkLabel}`}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => navigate(`/?challenge=${opponentName}`)}
                          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontFamily: '"Space Mono",monospace', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Revanche
                        </button>
                        <button onClick={() => navigate('/')} style={{ ...ghostBtn, width: '100%' }}>← Lobby</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* my hand */}
          <div style={{ width: '100%', maxWidth: '680px' }}>
            <OnlineHandPanel owner={botOwner} state={state} isMe={!!myColor} label={botLabel} clockMs={botClockMs} hasClock={hasClock} activeTurn={state.turn === botOwner && !over} settings={settings} onChip={handleHand} />
          </div>
        </div>

        {/* notation panel — hidden on mobile, sidebar on desktop */}
        <aside className="hidden lg:flex" style={{ width: '200px', flexShrink: 0, flexDirection: 'column', borderLeft: '1px solid var(--line)', padding: '12px 10px', gap: '8px', overflow: 'hidden' }}>
          <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', flexShrink: 0 }}>
            Lances
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {(game.notation_json ?? []).map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 6px', borderRadius: '6px',
                background: i === (game.notation_json ?? []).length - 1 ? 'var(--panel2)' : 'transparent',
              }}>
                <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '9px', color: 'var(--muted)', minWidth: '20px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ position: 'relative', width: '20px', height: '22px', flexShrink: 0 }}>
                  <PieceSVG cell={entry.cell} set={settings.set} fill />
                </div>
                <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', color: 'var(--ink)' }}>{entry.text}</span>
              </div>
            ))}
            {!(game.notation_json ?? []).length && (
              <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', color: 'var(--muted)', opacity: .5, padding: '6px' }}>nenhum lance</span>
            )}
          </div>
        </aside>

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
