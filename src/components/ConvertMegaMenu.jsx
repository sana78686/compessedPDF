import { CONVERT_TO_PDF, CONVERT_FROM_PDF } from '../config/convertMenu'
import { langPrefix } from '../i18n/translations'
import { ucWords } from '../utils/ucWords'
import './ConvertMegaMenu.css'

const size = 20

const convertIcons = {
  'jpg-to-pdf': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  'word-to-pdf': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h2l1 4 1-4h2" />
      <path d="M8 17h6" />
    </svg>
  ),
  'powerpoint-to-pdf': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 12h4c1.5 0 2.5 1 2.5 2.5S13.5 17 12 17H10" />
    </svg>
  ),
  'excel-to-pdf': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h2l1 2 1-2h2" />
      <path d="M8 17h6" />
    </svg>
  ),
  'html-to-pdf': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  'pdf-to-jpg': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  'pdf-to-word': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h2l1 4 1-4h2" />
      <path d="M8 17h6" />
    </svg>
  ),
  'pdf-to-powerpoint': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 12h4c1.5 0 2.5 1 2.5 2.5S13.5 17 12 17H10" />
    </svg>
  ),
  'pdf-to-excel': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h2l1 2 1-2h2" />
      <path d="M8 17h6" />
    </svg>
  ),
  'pdf-to-pdfa': (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  ),
}

function getIcon(slug) {
  return convertIcons[slug] || convertIcons['pdf-to-jpg']
}

export default function ConvertMegaMenu({ lang, t, isOpen, onClose }) {
  if (!isOpen) return null
  const getHref = (slug) => `${langPrefix(lang)}/${slug}`

  return (
    <div className="convert-mega-panel" role="dialog" aria-label="Convert PDF options">
      <div className="convert-mega-inner">
        <div className="convert-mega-column">
          <h3 className="convert-mega-category">{ucWords(t('megaMenu.convertToPdf'))}</h3>
          <ul className="convert-mega-list" role="list">
            {CONVERT_TO_PDF.map((item) => (
              <li key={item.slug}>
                <a href={getHref(item.slug)} className="convert-mega-tool" onClick={onClose}>
                  <span className="convert-mega-tool-icon convert-mega-tool-icon--to" aria-hidden>
                    {getIcon(item.slug)}
                  </span>
                  <span className="convert-mega-tool-label">{ucWords(t(item.labelKey))}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="convert-mega-column">
          <h3 className="convert-mega-category">{ucWords(t('megaMenu.convertFromPdf'))}</h3>
          <ul className="convert-mega-list" role="list">
            {CONVERT_FROM_PDF.map((item) => (
              <li key={item.slug}>
                <a href={getHref(item.slug)} className="convert-mega-tool" onClick={onClose}>
                  <span className="convert-mega-tool-icon convert-mega-tool-icon--from" aria-hidden>
                    {getIcon(item.slug)}
                  </span>
                  <span className="convert-mega-tool-label">{ucWords(t(item.labelKey))}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
