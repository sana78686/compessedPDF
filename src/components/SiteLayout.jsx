import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { supportedLangs, langOptions, defaultLang, writeUserLocalePreference } from '../i18n/translations'
import { langShortLabel } from '../i18n/langMeta'
import { getPages, getLegalNav, getFaq, getContentLocales } from '../api/cms'
import BrandLogo from './BrandLogo'
import { COMPRESS_PDF_EN } from '../constants/brand'
import LangFlag from './LangFlag'
import '../pages/HomePage.css'

function faqListHasContent(res) {
  const list = res?.faq
  if (!Array.isArray(list) || list.length === 0) return false
  return list.some((item) => {
    const strip = (s) =>
      String(s ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    return strip(item.question).length > 0 || strip(item.answer).length > 0
  })
}

/* Lazy-load footer for faster LCP */
const Footer = lazy(() => import('./Footer'))

/*
 * Header nav intentionally minimal: logo (home) + language only.
 * Previously: Compress PDF link, All tools mega menu, Login, tools grid icon.
 * Uncomment the block below to restore those controls.
 *
 * import { PORTAL_LOGIN_URL, PORTAL_DASHBOARD_URL } from '../config/portal'
 * import { ucWords } from '../utils/ucWords'
 * const MegaMenu = lazy(() => import('./MegaMenu'))
 * const PORTAL_SESSION_COOKIE = 'compressedpdf_portal_session'
 *
 * Inside component: mega menu state/refs/effects, portal cookie check, then:
 * <nav className="nav" aria-label="Main navigation">
 *   <a href={`/${lang}`}>{ucWords(t('nav.compress'))}</a>
 *   <div className="nav-mega-wrap" ref={megaMenuRef}> ... All tools button + MegaMenu panel ... </div>
 * </nav>
 * {isPortalLoggedIn ? <a href={PORTAL_DASHBOARD_URL}>...</a> : <a href={PORTAL_LOGIN_URL}>...</a>}
 * <a href={`/${lang}/tools`} className="icon-more-tools">...</a>
 */

export default function SiteLayout({ children }) {
  const { lang } = useParams()
  const location = useLocation()
  const pathname = location.pathname
  const t = useTranslation(lang)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const langDropdownRef = useRef(null)
  const [footerPages, setFooterPages] = useState([])
  const [legalVisibility, setLegalVisibility] = useState({})
  const [showFaqLink, setShowFaqLink] = useState(false)
  /** Locales that have CMS page/blog content; null = show full supportedLangs list */
  const [publicContentLocales, setPublicContentLocales] = useState(null)

  const locale = supportedLangs.includes(lang) ? lang : defaultLang
  const langChoices = publicContentLocales ?? supportedLangs

  useEffect(() => {
    let cancelled = false
    getContentLocales(locale)
      .then((res) => {
        if (cancelled) return
        const raw = res?.locales
        if (!Array.isArray(raw) || raw.length === 0) {
          setPublicContentLocales(null)
          return
        }
        const merged = new Set(raw)
        merged.add(defaultLang)
        const filtered = supportedLangs.filter((l) => merged.has(l))
        setPublicContentLocales(filtered.length > 0 ? filtered : null)
      })
      .catch(() => {
        if (!cancelled) setPublicContentLocales(null)
      })
    return () => {
      cancelled = true
    }
  }, [locale])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getPages(locale).catch(() => ({ pages: [] })),
      getLegalNav(locale).catch(() => ({ legal: {} })),
      getFaq(locale).catch(() => ({ faq: [] })),
    ]).then(([pagesRes, legalNavRes, faqRes]) => {
      if (cancelled) return
      setFooterPages(Array.isArray(pagesRes?.pages) ? pagesRes.pages : [])
      const legal = legalNavRes?.legal
      setLegalVisibility(legal && typeof legal === 'object' ? legal : {})
      setShowFaqLink(faqListHasContent(faqRes))
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  useEffect(() => {
    if (typeof document !== 'undefined' && lang) {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [lang])

  useEffect(() => {
    function handleClickOutside(e) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false)
      }
    }
    if (langDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [langDropdownOpen])

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-inner header-inner--minimal">
          <BrandLogo href={`/${lang}`} ariaLabel={t('nav.home')} text={COMPRESS_PDF_EN} />
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
                <span className="lang-dropdown-flag" aria-hidden>
                  <LangFlag lang={supportedLangs.includes(lang) ? lang : defaultLang} width={22} />
                </span>
                <span className="lang-dropdown-label">{langShortLabel[lang] ?? lang?.toUpperCase() ?? 'EN'}</span>
                <span className="lang-dropdown-chevron" aria-hidden>▼</span>
              </button>
              {langDropdownOpen && (
                <ul className="lang-dropdown-menu" role="listbox">
                  {langChoices.map((l) => (
                    <li key={l} role="option" aria-selected={lang === l}>
                      <a
                        href={pathname.replace(new RegExp(`^/${lang}(/|$)`), `/${l}$1`)}
                        className={`lang-dropdown-item ${lang === l ? 'lang-dropdown-item--active' : ''}`}
                        onClick={() => {
                          writeUserLocalePreference(l)
                          setLangDropdownOpen(false)
                        }}
                      >
                        <span className="lang-dropdown-item-flag" aria-hidden>
                          <LangFlag lang={l} width={22} />
                        </span>
                        <span className="lang-dropdown-item-label">{langOptions[l]?.label ?? l.toUpperCase()}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="main cms-main" tabIndex="-1">
        {children}
      </main>

      <Suspense fallback={<div className="footer-placeholder" aria-hidden="true" />}>
        <Footer
          lang={lang}
          pathname={pathname}
          t={t}
          footerPages={footerPages}
          legalVisibility={legalVisibility}
          showFaqLink={showFaqLink}
        />
      </Suspense>
    </div>
  )
}
