import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AllToolsPage from './pages/AllToolsPage'
import ComingSoonPage from './pages/ComingSoonPage'
import { supportedLangs, defaultLang, getPreferredLang } from './i18n/translations'

function LangGuard({ children }) {
  const { lang } = useParams()
  if (!lang || !supportedLangs.includes(lang)) {
    return <Navigate to={`/${getPreferredLang()}`} replace />
  }
  return children
}

function PreferredLangRedirect() {
  const lang = getPreferredLang()
  return <Navigate to={`/${lang}`} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PreferredLangRedirect />} />
      <Route
        path="/:lang/tools"
        element={
          <LangGuard>
            <AllToolsPage />
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
      <Route
        path="/:lang/:tool"
        element={
          <LangGuard>
            <ComingSoonPage />
          </LangGuard>
        }
      />
      <Route
        path="/:lang"
        element={
          <LangGuard>
            <HomePage />
          </LangGuard>
        }
      />
      <Route path="*" element={<PreferredLangRedirect />} />
    </Routes>
  )
}

export default App
