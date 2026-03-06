import { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { supportedLangs, langOptions } from '../i18n/translations'
import { getPages } from '../api/cms'
import { PORTAL_LOGIN_URL, PORTAL_DASHBOARD_URL } from '../config/portal'
import { ucWords } from '../utils/ucWords'
import '../pages/HomePage.css'
import './ConvertMegaMenu.css'

/* Lazy-load below-the-fold and on-interaction components for faster LCP/FCP */
const Footer = lazy(() => import('./Footer'))
const MegaMenu = lazy(() => import('./MegaMenu'))
const ConvertMegaMenu = lazy(() => import('./ConvertMegaMenu'))

// Cookie name the portal can set on login (e.g. on .compresspdf.id) to show Dashboard instead of Login
const PORTAL_SESSION_COOKIE = 'compressedpdf_portal_session'

export default function SiteLayout({ children }) {
  const { lang } = useParams()
  const location = useLocation()
  const pathname = location.pathname
  const t = useTranslation(lang)
  const [cmsPages, setCmsPages] = useState([])
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [isPortalLoggedIn, setIsPortalLoggedIn] = useState(false)
  const langDropdownRef = useRef(null)
  const megaMenuRef = useRef(null)
  const megaMenuPanelRef = useRef(null)

  const headerPages = cmsPages.filter((p) => !p.placement || p.placement === 'header' || p.placement === 'both')
  const footerPages = cmsPages.filter((p) => !p.placement || p.placement === 'footer' || p.placement === 'both')

  /** Header nav tree: roots with .children (only for pages that have children in headerPages) */
  const headerNavTree = useMemo(() => {
    const roots = headerPages.filter((p) => !p.parent_id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    return roots.map((root) => ({
      ...root,
      children: headerPages.filter((p) => p.parent_id === root.id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }))
  }, [headerPages])

  const [cmsDropdownOpenId, setCmsDropdownOpenId] = useState(null)
  const cmsDropdownRef = useRef(null)
  const [convertMenuOpen, setConvertMenuOpen] = useState(false)
  const convertMenuRef = useRef(null)

  useEffect(() => {
    setIsPortalLoggedIn(typeof document !== 'undefined' && document.cookie.includes(PORTAL_SESSION_COOKIE))
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined' && lang) {
      document.documentElement.lang = lang
    }
  }, [lang])

  useEffect(() => {
    const id = requestIdleCallback
      ? requestIdleCallback(() => {
          getPages()
            .then((res) => setCmsPages(res.pages || []))
            .catch(() => setCmsPages([]))
        }, { timeout: 2000 })
      : setTimeout(() => {
          getPages()
            .then((res) => setCmsPages(res.pages || []))
            .catch(() => setCmsPages([]))
        }, 0)
    return () => (requestIdleCallback ? cancelIdleCallback(id) : clearTimeout(id))
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false)
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setMegaMenuOpen(false)
      }
      if (cmsDropdownRef.current && !cmsDropdownRef.current.contains(e.target)) {
        setCmsDropdownOpenId(null)
      }
      if (convertMenuRef.current && !convertMenuRef.current.contains(e.target)) {
        setConvertMenuOpen(false)
      }
      if (megaMenuOpen && megaMenuRef.current && !megaMenuRef.current.contains(e.target) && megaMenuPanelRef.current && !megaMenuPanelRef.current.contains(e.target)) {
        setMegaMenuOpen(false)
      }
    }
    if (langDropdownOpen || megaMenuOpen || cmsDropdownOpenId != null || convertMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [langDropdownOpen, megaMenuOpen, cmsDropdownOpenId, convertMenuOpen])

  useEffect(() => {
    setMegaMenuOpen(false)
    setCmsDropdownOpenId(null)
    setConvertMenuOpen(false)
  }, [pathname])

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-inner">
          <a href={`/${lang}`} className="logo" aria-label={t('nav.home')}>
            <img src="/logos/compresspdf.png" alt="compressedPDF" decoding="async" />
          </a>
          <nav className="nav" aria-label="Main navigation">
            <a href={`/${lang}/merge`}>{ucWords(t('nav.merge'))}</a>
            <a href={`/${lang}/split`}>{ucWords(t('nav.split'))}</a>
            <a href={`/${lang}`}>{ucWords(t('nav.compress'))}</a>
            <div className="nav-convert-wrap" ref={convertMenuRef}>
              <button
                type="button"
                className={`nav-link nav-link-convert-trigger ${convertMenuOpen ? 'nav-link-convert-trigger--open' : ''}`}
                onClick={() => {
                  setConvertMenuOpen((o) => !o)
                  setMegaMenuOpen(false)
                  setCmsDropdownOpenId(null)
                }}
                aria-expanded={convertMenuOpen}
                aria-haspopup="true"
                aria-label={t('nav.convert')}
              >
                {ucWords(t('nav.convert'))}
                <span className="nav-link-convert-chevron" aria-hidden>{convertMenuOpen ? '▲' : '▼'}</span>
              </button>
              {convertMenuOpen && (
                <Suspense fallback={null}>
                  <ConvertMegaMenu lang={lang} t={t} isOpen onClose={() => setConvertMenuOpen(false)} />
                </Suspense>
              )}
            </div>
            <a href={`/${lang}/blog`}>{ucWords(t('footerBlog'))}</a>
            <a href={`/${lang}/contact`}>{ucWords(t('footerContact'))}</a>
            <div className="nav-cms-wrap" ref={cmsDropdownRef}>
              {headerNavTree.map((node) =>
                node.children.length > 0 ? (
                  <div key={node.id} className="nav-cms-dropdown-wrap">
                    <button
                      type="button"
                      className={`nav-link nav-cms-trigger ${cmsDropdownOpenId === node.id ? 'nav-cms-trigger--open' : ''}`}
                      onClick={() => setCmsDropdownOpenId((id) => (id === node.id ? null : node.id))}
                      aria-expanded={cmsDropdownOpenId === node.id}
                      aria-haspopup="true"
                    >
                      {ucWords(node.title)}
                      <span className="nav-cms-chevron" aria-hidden>{cmsDropdownOpenId === node.id ? '▲' : '▼'}</span>
                    </button>
                  {cmsDropdownOpenId === node.id && (
                    <ul className="nav-cms-dropdown" role="menu">
                      <li role="none">
                        <a href={`/${lang}/page/${node.slug}`} role="menuitem" onClick={() => setCmsDropdownOpenId(null)}>
                          {ucWords(node.title)}
                        </a>
                      </li>
                      {node.children.map((child) => (
                        <li key={child.id} role="none">
                          <a href={`/${lang}/page/${child.slug}`} role="menuitem" onClick={() => setCmsDropdownOpenId(null)}>
                            {ucWords(child.title)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  </div>
                ) : (
                  <a key={node.id} href={`/${lang}/page/${node.slug}`}>{ucWords(node.title)}</a>
                )
              )}
            </div>
            <div className="nav-mega-wrap" ref={megaMenuRef}>
              <button
                type="button"
                className={`nav-link-mega-trigger ${megaMenuOpen ? 'nav-link-mega-trigger--open' : ''}`}
                onClick={() => setMegaMenuOpen((o) => !o)}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
                aria-label={t('nav.allTools')}
              >
                {ucWords(t('nav.allTools'))}
                <span className="nav-link-mega-chevron" aria-hidden>{megaMenuOpen ? '▲' : '▼'}</span>
              </button>
            </div>
          </nav>
          <div className="header-actions">
            <div className="lang-dropdown" ref={langDropdownRef}>
              <button
                type="button"
                className="lang-dropdown-trigger"
                onClick={() => setLangDropdownOpen((open) => !open)}
                aria-expanded={langDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Select language"
              >
                <span className="lang-dropdown-flag">{langOptions[lang]?.flag ?? '🌐'}</span>
                <span className="lang-dropdown-label">{langOptions[lang]?.label ?? (lang && lang.toUpperCase())}</span>
                <span className="lang-dropdown-chevron" aria-hidden>▼</span>
              </button>
              {langDropdownOpen && (
                <ul className="lang-dropdown-menu" role="listbox">
                  {supportedLangs.map((l) => (
                    <li key={l} role="option" aria-selected={lang === l}>
                      <a
                        href={pathname.replace(new RegExp(`^/${lang}(/|$)`), `/${l}$1`)}
                        className={`lang-dropdown-item ${lang === l ? 'lang-dropdown-item--active' : ''}`}
                        onClick={() => setLangDropdownOpen(false)}
                      >
                        <span className="lang-dropdown-item-flag">{langOptions[l]?.flag ?? '🌐'}</span>
                        <span className="lang-dropdown-item-label">{langOptions[l]?.label ?? l.toUpperCase()}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {isPortalLoggedIn ? (
              <a href={PORTAL_DASHBOARD_URL} target="_blank" rel="noopener noreferrer">{ucWords(t('nav.dashboard'))}</a>
            ) : (
              <a href={PORTAL_LOGIN_URL} target="_blank" rel="noopener noreferrer">{ucWords(t('nav.login'))}</a>
            )}
            <a href={`/${lang}/tools`} className="icon-more-tools" aria-label={t('nav.allTools')} title={t('nav.allTools')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="3" y="3" width="5" height="5" rx="0.5" />
                <rect x="10" y="3" width="5" height="5" rx="0.5" />
                <rect x="17" y="3" width="5" height="5" rx="0.5" />
                <rect x="3" y="10" width="5" height="5" rx="0.5" />
                <rect x="10" y="10" width="5" height="5" rx="0.5" />
                <rect x="17" y="10" width="5" height="5" rx="0.5" />
                <rect x="3" y="17" width="5" height="5" rx="0.5" />
                <rect x="10" y="17" width="5" height="5" rx="0.5" />
                <rect x="17" y="17" width="5" height="5" rx="0.5" />
              </svg>
            </a>
          </div>
        </div>
        {megaMenuOpen && (
          <div className="mega-menu-row" ref={megaMenuPanelRef}>
            <div className="mega-menu-row-inner">
              <Suspense fallback={null}>
                <MegaMenu lang={lang} t={t} isOpen onClose={() => setMegaMenuOpen(false)} />
              </Suspense>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="main cms-main" tabIndex="-1">
        {children}
      </main>

      <Suspense fallback={<div className="footer-placeholder" aria-hidden="true" />}>
        <Footer lang={lang} pathname={pathname} t={t} footerPages={footerPages} />
      </Suspense>
    </div>
  )
}
