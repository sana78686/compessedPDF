import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams, useLocation, Outlet } from 'react-router-dom'
import SiteLayout from './components/SiteLayout'
import DynamicSeoHead from './components/DynamicSeoHead'
import HreflangLinks from './components/HreflangLinks'
import { supportedLangs, defaultLang, getPreferredLang } from './i18n/translations'
import GeoLangRedirect from './components/GeoLangRedirect'

const HomePage = lazy(() => import('./pages/HomePage'))
const AllToolsPage = lazy(() => import('./pages/AllToolsPage'))
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'))
const CmsPage = lazy(() => import('./pages/CmsPage'))
const CmsBlog = lazy(() => import('./pages/CmsBlog'))
const BlogListPage = lazy(() => import('./pages/BlogListPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LegalContentPage = lazy(() => import('./pages/LegalContentPage'))

function LangGuard({ children }) {
  const { lang } = useParams()
  const location = useLocation()
  if (lang === defaultLang) {
    const rest = location.pathname.replace(/^\/[a-z]{2}\/?/, '/').replace(/\/+$/, '') || '/'
    return <Navigate to={rest + location.search} replace />
  }
  if (!lang || !supportedLangs.includes(lang)) {
    const pref = getPreferredLang()
    return <Navigate to={pref === defaultLang ? '/' : `/${pref}`} replace />
  }
  return children
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
    <>
      <DynamicSeoHead />
      <HreflangLinks />
      <Routes>
        {/* Non-default locale (e.g. /en/...) — LangGuard redirects /id/... → /... */}
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

        {/* Default locale (id) — no prefix in URL */}
        <Route element={<SiteLayoutWrapper />}>
          <Route path="/tools" element={<AllToolsPage />} />
          <Route path="/compress/result" element={<HomePage />} />
          <Route path="/compress" element={<HomePage />} />
          <Route path="/page/:slug" element={<CmsPage />} />
          <Route path="/blog/:slug" element={<CmsBlog />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal/:slug" element={<LegalContentPage />} />
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route path="*" element={<GeoLangRedirect />} />
      </Routes>
    </>
  )
}

export default App
