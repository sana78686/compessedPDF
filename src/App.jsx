import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { supportedLangs, defaultLang } from './i18n/translations'

function LangGuard({ children }) {
  const { lang } = useParams()
  if (!lang || !supportedLangs.includes(lang)) {
    return <Navigate to={`/${defaultLang}`} replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${defaultLang}`} replace />} />
      <Route
        path="/:lang"
        element={
          <LangGuard>
            <HomePage />
          </LangGuard>
        }
      />
      <Route
        path="/:lang/compress"
        element={
          <LangGuard>
            <HomePage />
          </LangGuard>
        }
      />
      <Route path="*" element={<Navigate to={`/${defaultLang}`} replace />} />
    </Routes>
  )
}

export default App
