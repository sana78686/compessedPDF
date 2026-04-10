import { MEGA_MENU_CATEGORIES } from '../config/toolsMegaMenu'
import { COMPRESS_PDF_EN } from '../constants/brand'
import { langPrefix } from '../i18n/translations'
import { ucWords } from '../utils/ucWords'
import { getMegaMenuIcon } from './MegaMenuIcons'
import './MegaMenu.css'

export default function MegaMenu({ lang, t, isOpen, onClose }) {
  if (!isOpen) return null
  const lp = langPrefix(lang)
  const getToolHref = (slug) => (slug === '' ? `${lp}/` : `${lp}/${slug}`)
  const getIconClass = (tool) => {
    if (tool.icon) return tool.icon
    if (tool.slug === '') return 'compress'
    return (tool.slug || 'default').toLowerCase().replace(/[^a-z0-9-]/g, '')
  }

  return (
    <div className="mega-menu-panel" role="dialog" aria-label="All PDF tools">
      <div className="mega-menu-inner">
        {MEGA_MENU_CATEGORIES.map((cat) => (
          <div key={cat.categoryKey} className="mega-menu-column">
            <h3 className="mega-menu-category">{ucWords(t(cat.categoryKey))}</h3>
            <ul className="mega-menu-tools" role="list">
              {cat.tools.map((tool) => (
                <li key={tool.slug || 'compress'}>
                  <a
                    href={getToolHref(tool.slug)}
                    className="mega-menu-tool"
                    onClick={onClose}
                  >
                    <span
                      className={`mega-menu-tool-icon mega-menu-tool-icon--${getIconClass(tool)}`}
                      aria-hidden
                    >
                      {getMegaMenuIcon(tool.slug)}
                    </span>
                    <span className="mega-menu-tool-label">
                      {tool.slug === '' ? COMPRESS_PDF_EN : ucWords(t(tool.labelKey))}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
