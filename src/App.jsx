import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AllToolsPage from './pages/AllToolsPage'
import ComingSoonPage from './pages/ComingSoonPage'
import CmsPage from './pages/CmsPage'
import CmsBlog from './pages/CmsBlog'
import { supportedLangs, getPreferredLang } from './i18n/translations'

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
        path="/:lang/compress/result"
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
      <Route
        path="/:lang/page/:slug"
        element={
          <LangGuard>
            <CmsPage />
          </LangGuard>
        }
      />
      <Route
        path="/:lang/blog/:slug"
        element={
          <LangGuard>
            <CmsBlog />
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
