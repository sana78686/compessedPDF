import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { supportedLangs, langOptions } from '../i18n/translations'
import './HomePage.css'
import './AllToolsPage.css'

const TOOLS_LIST = [
  { slug: 'merge', labelKey: 'tools.mergePdf', available: false },
  { slug: 'split', labelKey: 'tools.splitPdf', available: false },
  { slug: '', labelKey: 'tools.compressPdf', available: true },
  { slug: 'edit', labelKey: 'tools.editPdf', available: false },
  { slug: 'sign', labelKey: 'tools.signPdf', available: false },
  { slug: 'convert', labelKey: 'tools.convertPdf', available: false },
  { slug: 'images-to-pdf', labelKey: 'tools.imagesToPdf', available: false },
  { slug: 'pdf-to-images', labelKey: 'tools.pdfToImages', available: false },
  { slug: 'extract-images', labelKey: 'tools.extractImages', available: false },
  { slug: 'protect', labelKey: 'tools.protectPdf', available: false },
  { slug: 'unlock', labelKey: 'tools.unlockPdf', available: false },
  { slug: 'rotate', labelKey: 'tools.rotatePdf', available: false },
  { slug: 'remove-pages', labelKey: 'tools.removePages', available: false },
  { slug: 'extract-pages', labelKey: 'tools.extractPages', available: false },
  { slug: 'rearrange', labelKey: 'tools.rearrangePages', available: false },
  { slug: 'webpage-to-pdf', labelKey: 'tools.webpageToPdf', available: false },
  { slug: 'ocr', labelKey: 'tools.pdfOcr', available: false },
  { slug: 'watermark', labelKey: 'tools.addWatermark', available: false },
  { slug: 'page-numbers', labelKey: 'tools.addPageNumbers', available: false },
  { slug: 'overlay', labelKey: 'tools.pdfOverlay', available: false },
  { slug: 'compare', labelKey: 'tools.comparePdfs', available: false },
  { slug: 'optimize', labelKey: 'tools.webOptimize', available: false },
  { slug: 'redact', labelKey: 'tools.redactPdf', available: false },
  { slug: 'create', labelKey: 'tools.createPdf', available: false },
]

function AllToolsPage() {
  const { lang = 'en' } = useParams()
  const t = useTranslation(lang)
  const pathname = `/${lang}/tools`
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

  const getToolHref = (tool) => {
    if (tool.available && tool.slug === '') return `/${lang}`
    if (tool.available) return `/${lang}/${tool.slug}`
    return `/${lang}/${tool.slug}`
  }

  return (
    <div className="all-tools-page home-page">
      <header className="header">
        <div className="header-inner">
          <a href={`/${lang}`} className="logo" aria-label={t('nav.home')}>
            I <span className="logo-heart">❤</span> PDF
          </a>
          <nav className="nav" aria-label="Main navigation">
            <a href={`/${lang}/merge`}>{t('nav.merge')}</a>
            <a href={`/${lang}/split`}>{t('nav.split')}</a>
            <a href={`/${lang}`}>{t('nav.compress')}</a>
            <a href={`/${lang}/convert`}>{t('nav.convert')}</a>
            <a href={`/${lang}/tools`} className="nav-active">{t('nav.allTools')}</a>
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
            <button type="button" className="btn-signup">
              {t('nav.signUp')}
            </button>
          </div>
        </div>
      </header>

      <main className="all-tools-main">
        <h1 className="all-tools-title">{t('tools.pageTitle')}</h1>
        <p className="all-tools-subtitle">{t('tools.frequentlyUsed')}</p>

        <div className="tools-grid">
          {TOOLS_LIST.map((tool) => (
            <a
              key={tool.slug || 'compress'}
              href={getToolHref(tool)}
              className={`tool-card ${tool.available ? 'tool-card--available' : ''}`}
            >
              <span className="tool-card-icon" aria-hidden>
                {tool.available && tool.slug === '' ? '📦' : '📄'}
              </span>
              <span className="tool-card-label">{t(tool.labelKey)}</span>
              {tool.available && (
                <span className="tool-card-badge" aria-hidden>✓</span>
              )}
            </a>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>{t('footer')}</p>
      </footer>
    </div>
  )
}

export default AllToolsPage
