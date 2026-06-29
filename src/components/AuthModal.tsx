import { useState } from 'react'
import { useAuth } from '../lib/auth'

type Tab = 'entrar' | 'cadastrar'

export default function AuthModal() {
  const { signIn, signUp, signInAsGuest } = useAuth()
  const [tab, setTab]           = useState<Tab>('entrar')
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const err = tab === 'entrar'
      ? await signIn(email, password)
      : await signUp(email, password, username)
    if (err) setError(err)
    else if (tab === 'cadastrar') setEmailSent(true)
    setBusy(false)
  }

  async function handleGuest() {
    setError(null)
    setBusy(true)
    const err = await signInAsGuest()
    if (err) setError(err)
    setBusy(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(20,16,12,.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: '18px', padding: '32px 28px', width: '100%', maxWidth: '360px',
        boxShadow: '0 24px 60px rgba(0,0,0,.55)',
      }}>

        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '26px', letterSpacing: '-.02em' }}>
            J-Chess
            <span style={{ fontFamily: '"Noto Serif JP",serif', fontWeight: 600, fontSize: '.65em', color: 'var(--muted)', marginLeft: '6px' }}>
              将棋
            </span>
          </div>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', marginBottom: '22px', background: 'var(--bg)', borderRadius: '10px', padding: '3px' }}>
          {(['entrar', 'cadastrar'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              style={{
                flex: 1, padding: '7px', border: 'none', cursor: 'pointer',
                borderRadius: '8px', fontFamily: '"Space Mono",monospace',
                fontSize: '11px', letterSpacing: '.04em', textTransform: 'uppercase',
                background: tab === t ? 'var(--panel2)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--muted)',
                transition: 'background .15s, color .15s',
              }}
            >
              {t === 'entrar' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {/* email sent confirmation screen */}
        {emailSent ? (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✉️</div>
            <p style={{ margin: '0 0 8px', fontFamily: '"Space Grotesk",sans-serif', fontWeight: 600, fontSize: '15px' }}>
              Confirme seu email
            </p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--muted)', fontFamily: '"Hanken Grotesk",sans-serif', lineHeight: 1.5 }}>
              Enviamos um link de confirmação para <strong>{email}</strong>. Clique nele para ativar sua conta.
            </p>
            <button
              onClick={() => { setEmailSent(false); setTab('entrar') }}
              style={ghostBtn}
            >
              Voltar para entrar
            </button>
          </div>
        ) : (
          <>
            {/* form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tab === 'cadastrar' && (
                <input
                  placeholder="Nome de usuário"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  title="Apenas letras, números e _"
                  style={inputStyle}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
              />
              {error && (
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--warn)', fontFamily: '"Hanken Grotesk",sans-serif' }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={busy} style={primaryBtn}>
                {busy ? '...' : tab === 'entrar' ? 'Entrar' : 'Criar conta'}
              </button>
            </form>

            {/* divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: '"Space Mono",monospace' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            </div>

            {/* guest */}
            <button onClick={handleGuest} disabled={busy} style={ghostBtn}>
              Jogar como convidado
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '9px',
  padding: '9px 12px', color: 'var(--ink)', fontSize: '13px',
  fontFamily: '"Hanken Grotesk",sans-serif', outline: 'none', width: '100%',
  boxSizing: 'border-box',
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--accent)', color: '#fff', border: 'none',
  borderRadius: '10px', padding: '10px', fontFamily: '"Space Mono",monospace',
  fontSize: '12px', letterSpacing: '.04em', cursor: 'pointer',
  fontWeight: 700, marginTop: '4px',
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)',
  borderRadius: '10px', padding: '10px', fontFamily: '"Space Mono",monospace',
  fontSize: '11px', letterSpacing: '.04em', cursor: 'pointer', width: '100%',
}
