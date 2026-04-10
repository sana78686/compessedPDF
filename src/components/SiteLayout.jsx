import { useState, useRef, useEffect, lazy, Suspense, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { supportedLangs, langOptions, defaultLang, langPrefix, writeUserLocalePreference } from '../i18n/translations'
import { langShortLabel } from '../i18n/langMeta'
import { useLang } from '../hooks/useLang'
import { getPages, getLegalNav, getFaq } from '../api/cms'
import BrandLogo from './BrandLogo'
import { COMPRESS_PDF_EN } from '../constants/brand'
import LangFlag from './LangFlag'
import { ucWords } from '../utils/ucWords'
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

const Footer = lazy(() => import('./Footer'))

/**
 * Build the URL for switching to language `target` from the current pathname.
 * Default locale (id) has no prefix; non-default (/en) has a prefix.
 */
function buildLangSwitchHref(pathname, currentLang, targetLang) {
  let suffix = pathname
  if (currentLang !== defaultLang) {
    suffix = pathname.replace(new RegExp(`^/${currentLang}(/|$)`), '$1') || '/'
  }
  if (!suffix.startsWith('/')) suffix = '/' + suffix
  if (targetLang === defaultLang) return suffix
  return `/${targetLang}${suffix === '/' ? '' : suffix}`
}

export default function SiteLayout({ children }) {
  const lang = useLang()
  const location = useLocation()
  const pathname = location.pathname
  const t = useTranslation(lang)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const langDropdownRef = useRef(null)
  const [footerPages, setFooterPages] = useState([])
  const [legalVisibility, setLegalVisibility] = useState({})
  const [showFaqLink, setShowFaqLink] = useState(false)

  const locale = lang

  const headerCmsPages = useMemo(
    () =>
      footerPages.filter(
        (p) => p.placement === 'header' || p.placement === 'both',
      ),
    [footerPages],
  )

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
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = 'ltr'
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

  const lp = langPrefix(lang)

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-inner header-inner--minimal">
          <BrandLogo href={`${lp}/`} ariaLabel={t('nav.home')} text={COMPRESS_PDF_EN} />
          {headerCmsPages.length > 0 && (
            <nav className="header-cms-nav" aria-label="Site pages">
              <ul className="header-cms-nav-list">
                {headerCmsPages.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`${lp}/page/${p.slug}`}
                      className="header-cms-nav-link"
                    >
                      {ucWords(p.title)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
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
                  <LangFlag lang={lang} width={22} />
                </span>
                <span className="lang-dropdown-label">{langShortLabel[lang] ?? lang?.toUpperCase() ?? 'ID'}</span>
                <span className="lang-dropdown-chevron" aria-hidden>▼</span>
              </button>
              {langDropdownOpen && (
                <ul className="lang-dropdown-menu" role="listbox">
                  {supportedLangs.map((l) => (
                    <li key={l} role="option" aria-selected={lang === l}>
                      <a
                        href={buildLangSwitchHref(pathname, lang, l)}
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
