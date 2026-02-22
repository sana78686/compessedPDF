import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'

function App() {
  return (
    <Routes>
      <Route path="/en" element={<HomePage />} />
      <Route path="/en/compress" element={<HomePage />} />
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path="*" element={<Navigate to="/en" replace />} />
    </Routes>
  )
}

export default App
