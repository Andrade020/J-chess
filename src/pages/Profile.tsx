import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Profile } from '../lib/auth'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { profile: myProfile, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!username) return
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
      .then(({ data }) => { setProfile(data as Profile); setLoading(false) })
  }, [username])

  const isMe = myProfile?.username === username

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => navigate('/')} style={ghostBtn}>← Lobby</button>
        <div style={{ flex: 1 }} />
        {myProfile && (
          <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '11px', color: 'var(--muted)' }}>
            {myProfile.username}
          </span>
        )}
        <button onClick={signOut} style={ghostBtn}>⇥ Sair</button>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        {loading ? (
          <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '13px', color: 'var(--muted)' }}>carregando...</span>
        ) : !profile ? (
          <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '13px', color: 'var(--warn)' }}>Usuário não encontrado.</span>
        ) : (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '18px', padding: '32px', width: '100%', maxWidth: '380px' }}>
            {/* avatar placeholder */}
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--panel2)', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '28px', color: 'var(--muted)' }}>
                {profile.username[0].toUpperCase()}
              </span>
            </div>

            <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '22px', marginBottom: '4px' }}>
              {profile.username}
              {profile.is_guest && <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '11px', color: 'var(--muted)', marginLeft: '8px', fontWeight: 400 }}>convidado</span>}
            </div>

            {!profile.is_guest && (
              <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '28px', fontWeight: 700, color: 'var(--accent)', marginBottom: '24px' }}>
                {profile.rating}
              </div>
            )}

            {/* stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Jogadas', val: profile.games_played },
                { label: 'Vitórias', val: profile.games_won },
                { label: 'Derrotas', val: profile.games_played - profile.games_won - profile.games_drawn },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontFamily: '"Space Mono",monospace', fontWeight: 700, fontSize: '20px' }}>{val}</div>
                  <div style={{ fontFamily: '"Space Mono",monospace', fontSize: '9px', color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>

            {!isMe && (
              <button
                onClick={() => navigate(`/?challenge=${profile.username}`)}
                style={{ ...primaryBtn, width: '100%' }}
              >
                Desafiar {profile.username}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)',
  borderRadius: '8px', padding: '5px 10px', fontFamily: '"Space Mono",monospace',
  fontSize: '11px', cursor: 'pointer',
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--accent)', color: '#fff', border: 'none',
  borderRadius: '10px', padding: '10px', fontFamily: '"Space Mono",monospace',
  fontSize: '12px', letterSpacing: '.04em', cursor: 'pointer', fontWeight: 700,
}
