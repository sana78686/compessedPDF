import { useState, useRef, useEffect } from 'react'
import { supportedLangs, langOptions } from '../i18n/translations'
import './Footer.css'

export default function Footer({ lang, pathname, t, footerPages = [] }) {
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    if (langOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [langOpen])

  const langPrefix = supportedLangs.includes(lang) ? lang : 'en'

  return (
    <footer className="footer footer--dark">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-columns">
            <div className="footer-col">
              <h3 className="footer-col-title">{t('footerProduct')}</h3>
              <a href={`/${langPrefix}`}>{t('footerHome')}</a>
              <a href={`/${langPrefix}#features`}>{t('footerFeatures')}</a>
              <a href={`/${langPrefix}#pricing`}>{t('footerPricing')}</a>
              <a href={`/${langPrefix}/tools`}>{t('footerTools')}</a>
              <a href={`/${langPrefix}#faq`}>{t('footerFaq')}</a>
            </div>
            <div className="footer-col">
              <h3 className="footer-col-title">{t('footerResources')}</h3>
              <a href="#desktop">compressedPDF Desktop</a>
              <a href="#mobile">compressedPDF Mobile</a>
              <a href="#api">API</a>
            </div>
            <div className="footer-col">
              <h3 className="footer-col-title">{t('footerSolutions')}</h3>
              <a href="#business">{t('footerBusiness')}</a>
              <a href="#education">{t('footerEducation')}</a>
            </div>
            <div className="footer-col">
              <h3 className="footer-col-title">{t('footerLegal')}</h3>
              <a href="#security">{t('footerSecurity')}</a>
              <a href="#privacy">{t('footerPrivacy')}</a>
              <a href="#terms">{t('footerTerms')}</a>
              <a href="#cookies">{t('footerCookies')}</a>
            </div>
            <div className="footer-col">
              <h3 className="footer-col-title">{t('footerCompany')}</h3>
              {footerPages.map((p) => (
                <a key={p.id} href={`/${langPrefix}/page/${p.slug}`}>{p.title}</a>
              ))}
              <a href="#contact">{t('footerContact')}</a>
              <a href={`/${langPrefix}/blog`}>{t('footerBlog')}</a>
              <a href="#press">{t('footerPress')}</a>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="footer-lang-wrap" ref={langRef}>
            <button
              type="button"
              className="footer-lang-btn"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              aria-label="Select language"
            >
              <span className="footer-lang-icon" aria-hidden>🌐</span>
              <span>{langOptions[langPrefix]?.label || t('footerLanguage')}</span>
              <span className="footer-lang-chevron" aria-hidden>▼</span>
            </button>
            {langOpen && (
              <ul className="footer-lang-menu" role="listbox">
                {supportedLangs.map((l) => (
                  <li key={l} role="option">
                    <a
                      href={pathname ? pathname.replace(new RegExp(`^/${langPrefix}(/|$)`), `/${l}$1`) : `/${l}`}
                      className="footer-lang-item"
                    >
                      {langOptions[l]?.label || l.toUpperCase()}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="footer-social-copy">
            <nav className="footer-social" aria-label="Social links">
              <a href="#twitter" aria-label="X (Twitter)"><span className="footer-social-icon">𝕏</span></a>
              <a href="#facebook" aria-label="Facebook"><span className="footer-social-icon">f</span></a>
              <a href="#linkedin" aria-label="LinkedIn"><span className="footer-social-icon">in</span></a>
              <a href="#instagram" aria-label="Instagram"><span className="footer-social-icon">📷</span></a>
              <a href="#tiktok" aria-label="TikTok"><span className="footer-social-icon">♪</span></a>
            </nav>
            <p className="footer-copy">{t('footerCopyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
