import {
  supportedLangs,
  defaultLang,
  getPreferredLangFromBrowser,
  readLocaleHintCache,
  writeLocaleHintCache,
} from './translations'

/** Malaysia → Malay; Indonesia → Indonesian */
export function countryCodeToLang(code) {
  const c = String(code || '').toUpperCase()
  if (c === 'MY') return 'ms'
  if (c === 'ID') return 'id'
  return null
}

/** Rough location from device timezone (no network). */
export function timezoneToLang() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const t = tz.toLowerCase()
    if (/kuala|singapore|johor|sabah|sarawak|putrajaya|labuan|penang/.test(t)) return 'ms'
    if (/jakarta|makassar|jayapura|pontianak|bali|surabaya|indonesia/.test(t)) return 'id'
  } catch {
    /* ignore */
  }
  return null
}

/**
 * Async: IP country (ipwho.is, CORS-friendly) → timezone → browser → defaultLang (Indonesia).
 */
export async function resolvePreferredLangAsync() {
  const cached = readLocaleHintCache()
  if (cached) return cached

  let fromCountry = null
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 3000)
    const res = await fetch('https://ipwho.is/', { signal: ctrl.signal })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      if (data && data.success !== false && data.country_code) {
        fromCountry = countryCodeToLang(data.country_code)
      }
    }
  } catch {
    /* network / timeout / adblock */
  }

  const lang =
    fromCountry ||
    timezoneToLang() ||
    getPreferredLangFromBrowser() ||
    defaultLang

  if (supportedLangs.includes(lang)) writeLocaleHintCache(lang)
  return supportedLangs.includes(lang) ? lang : defaultLang
}
