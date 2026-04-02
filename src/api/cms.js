import { CMS_API_BASE, CMS_SITE_DOMAIN, normalizeSiteDomain } from '../config/cms.js'

/** false = /api/public/* + X-Domain (use if WAF returns 403 on /{domain}/api/public/*). */
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

/** Path: /{host}/api/public (default) or /api/public (legacy when VITE_API_DOMAIN_PATH=false). */
function publicApiRoot() {
  if (!useDomainInApiPath) {
    return '/api/public'
  }
  const host = resolveSiteDomainForApi()
  return `/${host}/api/public`
}

function withLocaleQuery(path, locale) {
  if (!locale) return path
  const joiner = path.includes('?') ? '&' : '?'
  return `${path}${joiner}locale=${encodeURIComponent(locale)}`
}

async function request(path, options = {}) {
  const { locale, ...fetchOptions } = options
  const url = `${CMS_API_BASE}${publicApiRoot()}${withLocaleQuery(path, locale)}`
  const headers = {
    Accept: 'application/json',
    ...fetchOptions.headers,
  }
  if (!useDomainInApiPath) {
    headers['X-Domain'] = resolveSiteDomainForApi()
  }
  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  return res.json()
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

/** @returns {Promise<{ contact_email?: string, contact_phone?: string, contact_address?: string }>} */
export function getContactSettings() {
  return request('/contact')
}

/**
 * Submit contact form. Email is sent to the address set in CMS Content Manager.
 * @param {{ name: string, email: string, subject: string, message: string, accepts_terms: boolean }} data
 */
export function submitContactForm(data) {
  return request('/contact/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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
