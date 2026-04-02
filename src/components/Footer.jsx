import { useState, useRef, useEffect } from 'react'
import { supportedLangs, langOptions, defaultLang } from '../i18n/translations'
import LangFlag from './LangFlag'
import { ucWords } from '../utils/ucWords'
import './Footer.css'

/** CMS pages: only placement footer or both appear under OTHER. */
export default function Footer({
  lang,
  pathname,
  t,
  footerPages = [],
  legalInFooter = { privacy: false, terms: false },
}) {
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  const cmsFooterLinks = footerPages.filter(
    (p) => p.placement === 'footer' || p.placement === 'both',
  )

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    if (langOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [langOpen])

  const langPrefix = supportedLangs.includes(lang) ? lang : defaultLang

  return (
    <footer className="footer footer--dark">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-columns">
            <div className="footer-col">
              <h3 className="footer-col-title">{t('footerCompany')}</h3>
              <a href={`/${langPrefix}/blog`}>{t('footerBlog')}</a>
              <a href={`/${langPrefix}/contact`}>{t('footerContact')}</a>
            </div>
            {cmsFooterLinks.length > 0 && (
              <div className="footer-col">
                <h3 className="footer-col-title">{t('footerOther')}</h3>
                {cmsFooterLinks.map((p) => (
                  <a key={p.id} href={`/${langPrefix}/page/${p.slug}`}>
                    {ucWords(p.title)}
                  </a>
                ))}
              </div>
            )}
            {(legalInFooter.privacy || legalInFooter.terms) && (
              <div className="footer-col">
                <h3 className="footer-col-title">{t('footerLegal')}</h3>
                {legalInFooter.privacy && (
                  <a href={`/${langPrefix}/legal/privacy-policy`}>{t('footerPrivacy')}</a>
                )}
                {legalInFooter.terms && (
                  <a href={`/${langPrefix}/legal/terms`}>{t('footerTerms')}</a>
                )}
              </div>
            )}
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
              <span className="footer-lang-icon" aria-hidden>
                <LangFlag lang={langPrefix} width={20} />
              </span>
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
                      <span className="footer-lang-item-flag" aria-hidden>
                        <LangFlag lang={l} width={18} />
                      </span>
                      <span>{langOptions[l]?.label || l.toUpperCase()}</span>
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
            <p className="footer-copy">
              <span>{t('footerCopyrightPrefix')}</span>
              <a
                href="https://apimstec.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('footerPoweredBy')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
