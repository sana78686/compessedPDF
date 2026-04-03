import { CMS_API_BASE, CMS_SITE_DOMAIN, normalizeSiteDomain } from '../config/cms.js'

/**
 * false = always use /api/public/* + X-Domain (recommended on many nginx/Plesk setups).
 * true (default) = try /{domain}/api/public/* first, then fall back to legacy on 404/403
 * (some servers treat the first segment like `compresspdf.id` as a static file and never hit Laravel).
 */
const useDomainInApiPath = import.meta.env.VITE_API_DOMAIN_PATH !== 'false'

/** Current site host for public API path (browser) or env fallback (SSR/build tools). */
function resolveSiteDomainForApi() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const h = normalizeSiteDomain(window.location.hostname)
    // Dev: Vite is often localhost while CMS domain is compresspdf.id (or set in .env).
    if (h === 'localhost' || h === '127.0.0.1') {
      return CMS_SITE_DOMAIN
    }
    return h
  }
  return CMS_SITE_DOMAIN
}

function withLocaleQuery(path, locale) {
  if (!locale) return path
  const joiner = path.includes('?') ? '&' : '?'
  return `${path}${joiner}locale=${encodeURIComponent(locale)}`
}

/**
 * @param {string} path - e.g. `/legal/terms`
 * @param {Record<string, unknown>} options
 */
async function request(path, options = {}) {
  const { locale, ...fetchOptions } = options
  const host = resolveSiteDomainForApi()

  /** @type {{ root: string, headers: Record<string, string> }[]} */
  const attempts = []
  if (useDomainInApiPath) {
    attempts.push({
      root: `/${host}/api/public`,
      headers: { Accept: 'application/json', ...(fetchOptions.headers || {}) },
    })
    attempts.push({
      root: '/api/public',
      headers: {
        Accept: 'application/json',
        'X-Domain': host,
        ...(fetchOptions.headers || {}),
      },
    })
  } else {
    attempts.push({
      root: '/api/public',
      headers: {
        Accept: 'application/json',
        'X-Domain': host,
        ...(fetchOptions.headers || {}),
      },
    })
  }

  for (let i = 0; i < attempts.length; i++) {
    const { root, headers } = attempts[i]
    const url = `${CMS_API_BASE}${root}${withLocaleQuery(path, locale)}`
    const res = await fetch(url, { ...fetchOptions, headers })
    if (res.ok) {
      return res.json()
    }
    const retry =
      useDomainInApiPath &&
      i === 0 &&
      attempts.length > 1 &&
      (res.status === 404 || res.status === 403)
    if (retry) {
      continue
    }
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  throw new Error('Public API request failed')
}

/** @param {string} [locale] - BCP-style code: id, en, ms, es, fr, ar, ru */
export function getPages(locale) {
  return request('/pages', { locale })
}

/** @param {string} slug @param {string} [locale] */
export function getPageBySlug(slug, locale) {
  return request(`/pages/${encodeURIComponent(slug)}`, { locale })
}

/**
 * Normalize API response to a blogs array. Handles { blogs }, { data }, Laravel pagination, or direct array.
 * @param {unknown} res - Raw API response
 * @returns {Array<{ id: number, title: string, slug: string, [key: string]: unknown }>}
 */
function normalizeBlogsResponse(res) {
  if (Array.isArray(res)) return res
  if (res && typeof res === 'object') {
    const raw =
      Array.isArray(res.blogs) ? res.blogs
      : Array.isArray(res.data) ? res.data
      : Array.isArray(res.posts) ? res.posts
      : Array.isArray(res.items) ? res.items
      : res.data && Array.isArray(res.data.data) ? res.data.data
      : []
    return raw
  }
  return []
}

/**
 * @param {string} [locale]
 * @returns {Promise<{ blogs: Array<{ id: number, title: string, slug: string, excerpt?: string, published_at?: string, og_image?: string, image?: string }> }>}
 */
export function getBlogs(locale) {
  return request('/blogs', { locale }).then((res) => ({
    blogs: normalizeBlogsResponse(res),
  }))
}

/** @param {string} slug @param {string} [locale] */
export function getBlogBySlug(slug, locale) {
  return request(`/blogs/${encodeURIComponent(slug)}`, { locale })
}

/**
 * @param {string} [locale]
 * @returns {Promise<{ contact_email?: string, contact_phone?: string, contact_address?: string }>}
 */
export function getContactSettings(locale) {
  return request('/contact', { locale })
}

/**
 * Submit contact form. Email is sent to the address set in CMS Content Manager.
 * @param {{ name: string, email: string, subject: string, message: string, accepts_terms: boolean }} data
 * @param {string} [locale]
 */
export function submitContactForm(data, locale) {
  return request('/contact/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    locale,
  })
}

/** @param {string} [locale] */
export function getFaq(locale) {
  return request('/faq', { locale })
}

/** @param {string} [locale] */
export function getHomeCards(locale) {
  return request('/home-cards', { locale })
}

/** @param {string} [locale] */
export function getHomePageContent(locale) {
  return request('/home-content', { locale })
}

/** @param {string} [locale] */
export function getHomeSeo(locale) {
  return request('/home-content', { locale })
}

/**
 * Legal/content page by slug: terms, privacy-policy, disclaimer, about-us, cookie-policy.
 * @param {string} slug
 * @param {string} [locale]
 */
export function getLegalPage(slug, locale) {
  return request(`/legal/${encodeURIComponent(slug)}`, { locale })
}

/** @param {string} [locale] @returns {Promise<{ legal: Record<string, boolean> }>} */
export function getLegalNav(locale) {
  return request('/legal-nav', { locale })
}
