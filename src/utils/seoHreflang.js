import { defaultLang, supportedLangs } from '../i18n/translations'

/**
 * Build hreflang link descriptors for a CMS page or blog (same slug across locales).
 * @param {string} slug
 * @param {string[]} alternateLocales - locale codes that have this slug
 * @param {'page' | 'blog'} kind
 * @param {string} origin - e.g. https://example.com
 */
export function buildHreflangAlternates(slug, alternateLocales, kind, origin) {
  const locs = Array.isArray(alternateLocales) ? [...new Set(alternateLocales)] : []
  if (locs.length === 0) return []

  const segment = kind === 'blog' ? 'blog' : 'page'
  const enc = encodeURIComponent(slug)
  const base = `${origin.replace(/\/$/, '')}`

  /** @type {{ hreflang: string, href: string }[]} */
  const out = []
  for (const loc of locs) {
    if (!supportedLangs.includes(loc)) continue
    out.push({ hreflang: loc, href: `${base}/${loc}/${segment}/${enc}` })
  }

  const order = [defaultLang, ...supportedLangs.filter((l) => l !== defaultLang)]
  const defaultPick = order.find((l) => locs.includes(l)) ?? locs[0]
  out.push({ hreflang: 'x-default', href: `${base}/${defaultPick}/${segment}/${enc}` })

  return out
}
