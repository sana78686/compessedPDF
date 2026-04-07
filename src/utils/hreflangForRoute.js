import { defaultLang, supportedLangs } from '../i18n/translations'

/**
 * Path after the language code, e.g. `/en/blog` → `blog`, `/en` → ``.
 */
export function suffixFromPathname(pathname) {
  if (!pathname || typeof pathname !== 'string') return ''
  const clean = pathname.replace(/\/+$/, '') || '/'
  const m = clean.match(/^\/[a-z]{2}(?:\/(.*))?$/)
  if (!m || !m[1]) return ''
  return m[1].replace(/\/$/, '')
}

/**
 * hreflang alternates for routes that use the same URL shape in every language.
 * @param {string} origin - e.g. https://compresspdf.id
 * @param {string} suffixPath - e.g. `blog`, `contact`, `compress/result` (no leading slash)
 */
export function buildLanguageAlternates(origin, suffixPath) {
  const base = String(origin).replace(/\/$/, '')
  const suffix = String(suffixPath || '').replace(/^\/+/, '').replace(/\/+$/, '')
  /** @type {{ hreflang: string, href: string }[]} */
  const out = []
  for (const loc of supportedLangs) {
    const path = suffix ? `/${loc}/${suffix}` : `/${loc}`
    out.push({ hreflang: loc, href: `${base}${path}` })
  }
  const defPath = suffix ? `/${defaultLang}/${suffix}` : `/${defaultLang}`
  out.push({ hreflang: 'x-default', href: `${base}${defPath}` })
  return out
}
