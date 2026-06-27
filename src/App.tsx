import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Game from './pages/Game'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="*" element={<Game />} />
      </Routes>
    </BrowserRouter>
  )
}
