import { useState, useRef, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { supportedLangs, langOptions } from '../i18n/translations'
import { getPages } from '../api/cms'
import Footer from './Footer'
import '../pages/HomePage.css'

export default function SiteLayout({ children }) {
  const { lang } = useParams()
  const location = useLocation()
  const pathname = location.pathname
  const t = useTranslation(lang)
  const [cmsPages, setCmsPages] = useState([])
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const langDropdownRef = useRef(null)

  const headerPages = cmsPages.filter((p) => p.placement === 'header' || p.placement === 'both')
  const footerPages = cmsPages.filter((p) => p.placement === 'footer' || p.placement === 'both')

  useEffect(() => {
    getPages()
      .then((res) => setCmsPages(res.pages || []))
      .catch(() => setCmsPages([]))
  }, [])

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
        <div className="header-inner">
          <a href={`/${lang}`} className="logo" aria-label={t('nav.home')}>
            compressedPDF
          </a>
          <nav className="nav" aria-label="Main navigation">
            <a href={`/${lang}/merge`}>{t('nav.merge')}</a>
            <a href={`/${lang}/split`}>{t('nav.split')}</a>
            <a href={`/${lang}`}>{t('nav.compress')}</a>
            <a href={`/${lang}/convert`}>{t('nav.convert')}</a>
            {headerPages.map((p) => (
              <a key={p.id} href={`/${lang}/page/${p.slug}`}>{p.title}</a>
            ))}
            <a href={`/${lang}/tools`}>{t('nav.allTools')}</a>
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
            <a href={`/${lang}/login`}>{t('nav.login')}</a>
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
      </header>

      <main id="main-content" className="main cms-main" tabIndex="-1">
        {children}
      </main>

      <Footer lang={lang} pathname={pathname} t={t} footerPages={footerPages} />
    </div>
  )
}
