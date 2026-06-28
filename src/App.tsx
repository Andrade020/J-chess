import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import AuthModal from './components/AuthModal'
import Game from './pages/Game'
import Home from './pages/Home'
import OnlineGame from './pages/OnlineGame'
import Profile from './pages/Profile'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Space Mono",monospace', fontSize: '13px', color: 'var(--muted)',
      }}>
        carregando...
      </div>
    )
  }

  return (
    <>
      {!user && <AuthModal />}
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/play"                element={<Game />} />
        <Route path="/game/:id"            element={<OnlineGame />} />
        <Route path="/profile/:username"   element={<Profile />} />
        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
