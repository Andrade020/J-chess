import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type User } from './supabase'

export interface Profile {
  id: string
  username: string
  rating: number
  games_played: number
  games_won: number
  games_drawn: number
  is_guest: boolean
}

interface AuthCtx {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, username: string) => Promise<string | null>
  signInAsGuest: () => Promise<string | null>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return (data as Profile) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshProfile() {
    if (!user) return
    const p = await fetchProfile(user.id)
    setProfile(p)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) setProfile(await fetchProfile(session.user.id))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_ev, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setProfile(await fetchProfile(session.user.id))
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signUp(email: string, password: string, username: string): Promise<string | null> {
    /* verifica disponibilidade do username antes de criar a conta */
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (existing) return 'Este nome de usuário já está em uso.'

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    return error?.message ?? null
  }

  async function signInAsGuest(): Promise<string | null> {
    const { error } = await supabase.auth.signInAnonymously({
      options: { data: { is_guest: true } },
    })
    return error?.message ?? null
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInAsGuest, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
