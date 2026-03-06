const FALLBACK_API_BASE = import.meta.env.PROD
  ? 'https://portal.compresspdf.id'
  : 'http://localhost:8000'

const API_BASE = (import.meta.env.VITE_API_URL || FALLBACK_API_BASE).replace(/\/$/, '')

async function request(path, options = {}) {
  const url = `${API_BASE}/api/public${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
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
