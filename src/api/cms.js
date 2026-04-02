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

async function request(path, options = {}) {
  const url = `${CMS_API_BASE}${publicApiRoot()}${path}`
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }
  if (!useDomainInApiPath) {
    headers['X-Domain'] = resolveSiteDomainForApi()
  }
  const res = await fetch(url, {
    ...options,
    headers,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  return res.json()
}

/** @returns {Promise<{ pages: Array<{ id: number, title: string, slug: string, meta_title?: string, meta_description?: string }> }>} */
export function getPages() {
  return request('/pages')
}

/** @param {string} slug */
export function getPageBySlug(slug) {
  return request(`/pages/${encodeURIComponent(slug)}`)
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
 * Fetch list of published blogs. Accepts { blogs }, { data }, { data: { data } }, or direct array.
 * @returns {Promise<{ blogs: Array<{ id: number, title: string, slug: string, excerpt?: string, published_at?: string, og_image?: string, image?: string }> }>}
 */
export function getBlogs() {
  return request('/blogs').then((res) => ({
    blogs: normalizeBlogsResponse(res),
  }))
}

/** @param {string} slug */
export function getBlogBySlug(slug) {
  return request(`/blogs/${encodeURIComponent(slug)}`)
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

/** @returns {Promise<{ faq: Array<{ id: number, question: string, answer: string, sort_order: number }> }>} */
export function getFaq() {
  return request('/faq')
}

/** @returns {Promise<{ cards: Array<{ id: number, title: string, description: string, icon: string|null, sort_order: number }> }>} */
export function getHomeCards() {
  return request('/home-cards')
}

/** @returns {Promise<{ content: string }>} Home page rich text (HTML) shown above FAQ */
export function getHomePageContent() {
  return request('/home-content')
}

/** @returns {Promise<{ meta_title: string, meta_description: string, meta_keywords: string, focus_keyword: string, og_title: string, og_description: string, og_image: string }>} Home page SEO meta tags */
export function getHomeSeo() {
  return request('/home-content')
}

/**
 * Legal/content page by slug: terms, privacy-policy, disclaimer, about-us, cookie-policy.
 * @param {string} slug
 * @returns {Promise<{ slug: string, title: string, content: string }>}
 */
export function getLegalPage(slug) {
  return request(`/legal/${encodeURIComponent(slug)}`)
}
