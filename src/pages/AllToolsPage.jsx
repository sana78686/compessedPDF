import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { defaultLang, langToOgLocale } from '../i18n/translations'
import { SeoHead } from '../components/SeoHead'
import { COMPRESS_PDF_EN } from '../constants/brand'
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
  const { lang = defaultLang } = useParams()
  const t = useTranslation(lang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const getToolHref = (tool) => {
    if (tool.available && tool.slug === '') return `/${lang}`
    if (tool.available) return `/${lang}/${tool.slug}`
    return `/${lang}/${tool.slug}`
  }

  return (
    <div className="all-tools-page home-page">
      <SeoHead
        title={t('tools.pageTitle')}
        description={t('tools.frequentlyUsed')}
        robots="index,follow"
        ogTitle={t('tools.pageTitle')}
        ogDescription={t('tools.frequentlyUsed')}
        ogLocale={langToOgLocale(lang)}
      />
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
              <span className="tool-card-label">
                {tool.slug === '' ? COMPRESS_PDF_EN : t(tool.labelKey)}
              </span>
              {tool.available && (
                <span className="tool-card-badge" aria-hidden>✓</span>
              )}
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}

export default AllToolsPage
