import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import AuthModal from './components/AuthModal'
import Game from './pages/Game'

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
        <Route path="/" element={<Game />} />
        <Route path="*" element={<Game />} />
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
