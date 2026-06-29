import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { newGame } from '../lib/engine'

interface LobbyEntry {
  id: string
  user_id: string
  time_control_secs: number | null
  time_control_inc: number
  game_id: string | null
  created_at: string
  profiles: { username: string; rating: number }
}

interface IncomingChallenge {
  id: string
  from_id: string
  time_control_secs: number | null
  time_control_inc: number
  profiles: { username: string; rating: number }
}

interface ActiveGame {
  id: string
  opponentName: string
  time_control_secs: number | null
  time_control_inc: number | null
}

const TC_OPTIONS = [
  { label: 'Sem tempo', secs: null, inc: 0 },
  { label: '3 min',   secs: 180,  inc: 0 },
  { label: '5+3',     secs: 300,  inc: 3 },
  { label: '10 min',  secs: 600,  inc: 0 },
  { label: '15+10',   secs: 900,  inc: 10 },
]

function tcLabel(secs: number | null, inc: number | null) {
  if (!secs) return 'Sem tempo'
  const m = Math.floor(secs / 60)
  return inc ? `${m}+${inc}` : `${m} min`
}

export default function Home() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [lobby, setLobby]               = useState<LobbyEntry[]>([])
  const [myLobbyId, setMyLobbyId]       = useState<string | null>(null)
  const [selectedTc, setSelectedTc]     = useState(0)
  const [busy, setBusy]                 = useState(false)
  const [lobbyErr, setLobbyErr]         = useState<string | null>(null)
  const [incoming, setIncoming]         = useState<IncomingChallenge[]>([])
  const [searchUser, setSearchUser]     = useState(searchParams.get('challenge') ?? '')
  const [searchResult, setSearchResult] = useState<{ id: string; username: string; rating: number } | null>(null)
  const [searchMsg, setSearchMsg]       = useState<string | null>(null)
  const [pendingChalId, setPendingChalId]   = useState<string | null>(null)
  const [pendingChalTo, setPendingChalTo]   = useState<string | null>(null)
  const [activeGames, setActiveGames]   = useState<ActiveGame[]>([])

  const myLobbyRef = useRef<string | null>(null)
  myLobbyRef.current = myLobbyId

  /* ── load lobby ── */
  useEffect(() => {
    supabase
      .from('lobby')
      .select('*, profiles(username, rating)')
      .gt('created_at', new Date(Date.now() - 10 * 60_000).toISOString())
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('lobby load:', error.message)
        else setLobby((data ?? []) as LobbyEntry[])
      })
  }, [])

  /* ── load active games ── */
  useEffect(() => {
    if (!user) return
    supabase
      .from('games')
      .select('id, light_id, dark_id, time_control_secs, time_control_inc, light_profile:profiles!games_light_id_fkey(username), dark_profile:profiles!games_dark_id_fkey(username)')
      .or(`light_id.eq.${user.id},dark_id.eq.${user.id}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return
        setActiveGames(data.map((g: Record<string, unknown>) => ({
          id: g.id as string,
          opponentName: g.light_id === user.id
            ? ((g.dark_profile  as { username: string } | null)?.username ?? 'Desconhecido')
            : ((g.light_profile as { username: string } | null)?.username ?? 'Desconhecido'),
          time_control_secs: g.time_control_secs as number | null,
          time_control_inc:  g.time_control_inc  as number | null,
        })))
      })
  }, [user])

  /* ── realtime: lobby table ── */
  useEffect(() => {
    const ch = supabase.channel('lobby-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby' }, async payload => {
        if (payload.eventType === 'INSERT') {
          const { data } = await supabase
            .from('lobby')
            .select('*, profiles(username, rating)')
            .eq('id', (payload.new as { id: string }).id)
            .single()
          if (data) setLobby(prev => [data as LobbyEntry, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as { id: string; game_id: string | null; user_id: string }
          if (updated.game_id && updated.user_id === user?.id) {
            navigate(`/game/${updated.game_id}`)
            return
          }
          setLobby(prev => prev.filter(e => e.id !== updated.id || !updated.game_id))
        } else if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id: string }).id
          setLobby(prev => prev.filter(e => e.id !== id))
          if (myLobbyRef.current === id) setMyLobbyId(null)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user, navigate])

  /* ── realtime: incoming direct challenges ── */
  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('challenges-rt')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'challenges',
        filter: `to_id=eq.${user.id}`,
      }, async payload => {
        const { data } = await supabase
          .from('challenges')
          .select('*, profiles!challenges_from_id_fkey(username, rating)')
          .eq('id', (payload.new as { id: string }).id)
          .single()
        if (data) setIncoming(prev => [data as IncomingChallenge, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user])

  /* ── realtime: watch outgoing challenge for acceptance ── */
  useEffect(() => {
    if (!pendingChalId) return
    const ch = supabase.channel(`chal-out-${pendingChalId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'challenges',
        filter: `id=eq.${pendingChalId}`,
      }, payload => {
        const updated = payload.new as { status: string; game_id?: string }
        if (updated.game_id) {
          navigate(`/game/${updated.game_id}`)
        } else if (updated.status === 'declined') {
          setPendingChalId(null)
          setPendingChalTo(null)
          setSearchMsg('Desafio recusado.')
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [pendingChalId, navigate])

  /* cleanup: delete my lobby on unmount */
  useEffect(() => {
    return () => {
      if (myLobbyRef.current)
        supabase.from('lobby').delete().eq('id', myLobbyRef.current)
    }
  }, [])

  /* ── create lobby challenge ── */
  async function createChallenge() {
    if (!profile) { setLobbyErr('Perfil não encontrado. Tente recarregar a página.'); return }
    setBusy(true)
    setLobbyErr(null)
    const tc = TC_OPTIONS[selectedTc]
    const { data, error } = await supabase
      .from('lobby')
      .insert({ user_id: profile.id, time_control_secs: tc.secs, time_control_inc: tc.inc })
      .select('id')
      .single()
    if (error) setLobbyErr(error.message)
    else if (data) setMyLobbyId((data as { id: string }).id)
    setBusy(false)
  }

  async function cancelChallenge() {
    if (!myLobbyId) return
    await supabase.from('lobby').delete().eq('id', myLobbyId)
    setMyLobbyId(null)
  }

  /* ── accept lobby challenge ── */
  async function acceptLobby(entryId: string) {
    setBusy(true)
    setLobbyErr(null)
    const initialState = newGame()
    const { data, error } = await supabase.rpc('accept_lobby_challenge', {
      p_lobby_id: entryId,
      p_initial_state: initialState as unknown as Record<string, unknown>,
    })
    if (error) { console.error('[acceptLobby]', error); setLobbyErr(`Erro ao aceitar: ${error.message}`) }
    else if (data) navigate(`/game/${data}`)
    else setLobbyErr('Desafio não retornou ID de partida.')
    setBusy(false)
  }

  /* ── search user ── */
  async function handleSearch() {
    if (!searchUser.trim()) return
    setSearchMsg(null)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, rating')
      .eq('username', searchUser.trim())
      .maybeSingle()
    if (error) console.error('[search] error:', error.code, error.message)
    if (!data) { setSearchMsg(`Usuário não encontrado.`); setSearchResult(null); return }
    if (data.id === user?.id) { setSearchMsg('Esse é você!'); setSearchResult(null); return }
    setSearchResult(data as { id: string; username: string; rating: number })
    setSearchMsg(null)
  }

  async function sendDirectChallenge() {
    if (!searchResult || !profile) return
    setBusy(true)
    const tc = TC_OPTIONS[selectedTc]
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        from_id: profile.id,
        to_id: searchResult.id,
        time_control_secs: tc.secs,
        time_control_inc: tc.inc,
      })
      .select('id')
      .single()
    if (!error && data) {
      setPendingChalId((data as { id: string }).id)
      setPendingChalTo(searchResult.username)
      setSearchResult(null)
      setSearchMsg(null)
    } else {
      setSearchMsg('Erro ao enviar desafio.')
    }
    setBusy(false)
  }

  async function cancelPendingChallenge() {
    if (!pendingChalId) return
    await supabase.from('challenges').update({ status: 'declined' }).eq('id', pendingChalId)
    setPendingChalId(null)
    setPendingChalTo(null)
  }

  /* ── accept direct challenge ── */
  async function acceptDirectChallenge(ch: IncomingChallenge) {
    setBusy(true)
    const { data, error } = await supabase.rpc('accept_direct_challenge', {
      p_challenge_id: ch.id,
      p_initial_state: newGame() as unknown as Record<string, unknown>,
    })
    if (error) { console.error('[acceptDirect]', error); alert(`Erro ao aceitar desafio: ${error.message}`) }
    else if (data) navigate(`/game/${data}`)
    setIncoming(prev => prev.filter(c => c.id !== ch.id))
    setBusy(false)
  }

  async function declineChallenge(id: string) {
    await supabase.from('challenges').update({ status: 'declined' }).eq('id', id)
    setIncoming(prev => prev.filter(c => c.id !== id))
  }

  /* ── render ── */
  const others = lobby.filter(e => e.user_id !== user?.id)

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-.01em' }}>
          J-Chess <span style={{ fontFamily: '"Noto Serif JP",serif', fontWeight: 600, fontSize: '.7em', color: 'var(--muted)' }}>将棋</span>
        </div>
        <div style={{ flex: 1 }} />
        {profile && (
          <button onClick={() => navigate(`/profile/${profile.username}`)} style={ghostBtn}>
            {profile.username}
            {!profile.is_guest && <span style={{ color: 'var(--accent)', marginLeft: '6px' }}>⭐{profile.rating}</span>}
          </button>
        )}
        <button onClick={signOut} style={ghostBtn}>⇥ Sair</button>
      </header>

      {/* incoming direct challenges */}
      {incoming.map(ch => (
        <div key={ch.id} style={{ background: 'var(--panel2)', borderBottom: '1px solid var(--line)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '12px', flex: 1 }}>
            <b>{ch.profiles?.username}</b> te desafiou · {tcLabel(ch.time_control_secs, ch.time_control_inc)}
          </span>
          <button onClick={() => acceptDirectChallenge(ch)} disabled={busy} style={accentBtn}>Aceitar</button>
          <button onClick={() => declineChallenge(ch.id)} style={ghostBtn}>Recusar</button>
        </div>
      ))}

      <main style={{ flex: 1, display: 'flex', gap: '20px', padding: '24px 20px', flexWrap: 'wrap', alignItems: 'flex-start', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {/* left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '0 0 280px' }}>

          {/* vs AI / local */}
          <section style={card}>
            <h2 style={cardTitle}>Jogar</h2>
            <button onClick={() => navigate('/play')} style={{ ...accentBtn, width: '100%', marginBottom: '8px' }}>
              vs Computador
            </button>
            <button onClick={() => navigate('/play?mode=local')} style={{ ...ghostBtn, width: '100%' }}>
              vs Humano (local)
            </button>
          </section>

          {/* create open challenge */}
          <section style={card}>
            <h2 style={cardTitle}>Desafio Online</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {TC_OPTIONS.map((tc, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTc(i)}
                  style={{
                    fontFamily: '"Space Mono",monospace', fontSize: '10px', padding: '5px 9px',
                    borderRadius: '7px', cursor: 'pointer', border: '1px solid var(--line)',
                    background: selectedTc === i ? 'var(--accent)' : 'var(--panel2)',
                    color: selectedTc === i ? '#fff' : 'var(--ink)',
                  }}
                >
                  {tc.label}
                </button>
              ))}
            </div>
            {lobbyErr && (
              <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', color: 'var(--warn)', marginBottom: '8px', wordBreak: 'break-word' }}>
                {lobbyErr}
              </div>
            )}
            {myLobbyId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
                  Aguardando oponente...
                </div>
                <button onClick={cancelChallenge} style={{ ...ghostBtn, width: '100%' }}>Cancelar</button>
              </div>
            ) : (
              <button onClick={createChallenge} disabled={busy} style={{ ...accentBtn, width: '100%' }}>
                Criar desafio
              </button>
            )}
          </section>

          {/* direct challenge */}
          <section style={card}>
            <h2 style={cardTitle}>Desafiar usuário</h2>
            {pendingChalId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
                  Aguardando <b style={{ color: 'var(--ink)' }}>{pendingChalTo}</b>...
                </div>
                <button onClick={cancelPendingChallenge} style={{ ...ghostBtn, width: '100%' }}>Cancelar desafio</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    placeholder="username"
                    value={searchUser}
                    onChange={e => { setSearchUser(e.target.value); setSearchResult(null); setSearchMsg(null) }}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    style={inputStyle}
                  />
                  <button onClick={handleSearch} style={accentBtn}>→</button>
                </div>
                {searchMsg && <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', fontFamily: '"Space Mono",monospace' }}>{searchMsg}</p>}
                {searchResult && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg)', borderRadius: '8px', padding: '8px 10px' }}>
                    <span style={{ flex: 1, fontFamily: '"Space Mono",monospace', fontSize: '11px' }}>
                      {searchResult.username} · ⭐{searchResult.rating}
                    </span>
                    <button onClick={sendDirectChallenge} disabled={busy} style={accentBtn}>Desafiar</button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* right column */}
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* active games */}
          {activeGames.length > 0 && (
            <div>
              <h2 style={{ ...cardTitle, marginBottom: '12px' }}>Jogos em andamento</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeGames.map(g => (
                  <div key={g.id} style={{ background: 'var(--panel)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '12px', fontWeight: 700 }}>
                        vs {g.opponentName}
                      </div>
                      <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                        {tcLabel(g.time_control_secs, g.time_control_inc)}
                      </div>
                    </div>
                    <button onClick={() => navigate(`/game/${g.id}`)} style={accentBtn}>
                      Continuar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* open challenges */}
          <div>
            <h2 style={{ ...cardTitle, marginBottom: '12px' }}>Desafios abertos</h2>
            {others.length === 0 ? (
              <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '12px', color: 'var(--muted)', padding: '20px 0' }}>
                Nenhum desafio aberto no momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {others.map(e => (
                  <div key={e.id} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => navigate(`/profile/${e.profiles?.username}`)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', flex: 1 }}
                    >
                      <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '12px', fontWeight: 700 }}>{e.profiles?.username}</div>
                      <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                        ⭐{e.profiles?.rating} · {tcLabel(e.time_control_secs, e.time_control_inc)}
                      </div>
                    </button>
                    <button onClick={() => acceptLobby(e.id)} disabled={busy} style={accentBtn}>
                      Aceitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

const card: React.CSSProperties = {
  background: 'var(--panel)', border: '1px solid var(--line)',
  borderRadius: '14px', padding: '16px',
}
const cardTitle: React.CSSProperties = {
  fontFamily: '"Space Mono",monospace', fontSize: '10px', letterSpacing: '.08em',
  textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px',
}
const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)',
  borderRadius: '8px', padding: '6px 10px', fontFamily: '"Space Mono",monospace',
  fontSize: '11px', cursor: 'pointer',
}
const accentBtn: React.CSSProperties = {
  background: 'var(--accent)', color: '#fff', border: 'none',
  borderRadius: '8px', padding: '7px 12px', fontFamily: '"Space Mono",monospace',
  fontSize: '11px', cursor: 'pointer', fontWeight: 700, flexShrink: 0,
}
const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px',
  padding: '7px 10px', color: 'var(--ink)', fontSize: '12px', flex: 1,
  fontFamily: '"Space Mono",monospace', outline: 'none',
}
