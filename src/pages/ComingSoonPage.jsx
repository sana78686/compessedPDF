import { useParams, useLocation, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { supportedLangs, langOptions } from '../i18n/translations'
import { useState, useRef, useEffect } from 'react'
import './HomePage.css'
import './ComingSoonPage.css'

function ComingSoonPage() {
  const { lang = 'en', tool } = useParams()
  const { pathname } = useLocation()
  const t = useTranslation(lang)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const langDropdownRef = useRef(null)

  useEffect(() => {
    document.documentElement.lang = lang
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
    <div className="coming-soon-page home-page">
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
            <a href={`/${lang}/tools`}>{t('nav.allTools')}</a>
          </nav>
          <div className="header-actions">
            <div className="lang-dropdown" ref={langDropdownRef}>
              <button
                type="button"
                className="lang-dropdown-trigger"
                onClick={() => setLangDropdownOpen((o) => !o)}
                aria-expanded={langDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Select language"
              >
                <span className="lang-dropdown-flag">{langOptions[lang]?.flag ?? '🌐'}</span>
                <span className="lang-dropdown-label">{langOptions[lang]?.label ?? lang.toUpperCase()}</span>
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
          </div>
        </div>
      </header>

      <main className="coming-soon-main">
        <h1 className="coming-soon-title">Coming soon</h1>
        <p className="coming-soon-text">This tool is under development. Try our Compress PDF tool in the meantime.</p>
        <Link to={`/${lang}/tools`} className="coming-soon-btn">All PDF Tools</Link>
      </main>

      <footer className="footer">
        <p>{t('footer')}</p>
      </footer>
    </div>
  )
}

export default ComingSoonPage
