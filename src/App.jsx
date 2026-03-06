import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams, Outlet } from 'react-router-dom'
import SiteLayout from './components/SiteLayout'
import HomePage from './pages/HomePage'
import { supportedLangs, getPreferredLang } from './i18n/translations'

/* Route-level code splitting: keep initial bundle small for LCP/TBT (Lighthouse Performance) */
const AllToolsPage = lazy(() => import('./pages/AllToolsPage'))
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'))
const CmsPage = lazy(() => import('./pages/CmsPage'))
const CmsBlog = lazy(() => import('./pages/CmsBlog'))
const BlogListPage = lazy(() => import('./pages/BlogListPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LegalContentPage = lazy(() => import('./pages/LegalContentPage'))

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

function PageFallback() {
  return (
    <div className="route-fallback" style={{ minHeight: '120px' }} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
    </div>
  )
}

function SiteLayoutWrapper() {
  return (
    <SiteLayout>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </SiteLayout>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PreferredLangRedirect />} />
      <Route element={<LangGuard><SiteLayoutWrapper /></LangGuard>}>
        <Route path="/:lang/tools" element={<AllToolsPage />} />
        <Route path="/:lang/compress/result" element={<HomePage />} />
        <Route path="/:lang/compress" element={<HomePage />} />
        <Route path="/:lang/page/:slug" element={<CmsPage />} />
        <Route path="/:lang/blog/:slug" element={<CmsBlog />} />
        <Route path="/:lang/blog" element={<BlogListPage />} />
        <Route path="/:lang/contact" element={<ContactPage />} />
        <Route path="/:lang/legal/:slug" element={<LegalContentPage />} />
        <Route path="/:lang/:tool" element={<ComingSoonPage />} />
        <Route path="/:lang" element={<HomePage />} />
      </Route>
      <Route path="*" element={<PreferredLangRedirect />} />
    </Routes>
  )
}

export default App
