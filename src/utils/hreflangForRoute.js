import { defaultLang, supportedLangs, langPrefix } from '../i18n/translations'

/**
 * Path suffix after the language segment (or from root for default locale).
 * `/en/blog` → `blog`, `/en` → ``, `/blog` → `blog`, `/` → ``
 */
export function suffixFromPathname(pathname) {
  if (!pathname || typeof pathname !== 'string') return ''
  const clean = pathname.replace(/\/+$/, '') || '/'
  const m = clean.match(/^\/([a-z]{2})(?:\/(.*))?$/)
  if (m && supportedLangs.includes(m[1])) {
    return (m[2] || '').replace(/\/$/, '')
  }
  return clean.replace(/^\//, '').replace(/\/$/, '')
}

/**
 * hreflang alternates for routes that share the same URL shape across languages.
 * Default locale uses no prefix; non-default uses /{lang}/...
 */
export function buildLanguageAlternates(origin, suffixPath) {
  const base = String(origin).replace(/\/$/, '')
  const suffix = String(suffixPath || '').replace(/^\/+/, '').replace(/\/+$/, '')
  const out = []
  for (const loc of supportedLangs) {
    const prefix = langPrefix(loc)
    const path = suffix ? `${prefix}/${suffix}` : (prefix || '/')
    out.push({ hreflang: loc, href: `${base}${path}` })
  }
  const defPath = suffix ? `/${suffix}` : '/'
  out.push({ hreflang: 'x-default', href: `${base}${defPath}` })
  return out
}
