const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || 'http://localhost:8000'

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

/** @returns {Promise<{ blogs: Array<{ id: number, title: string, slug: string, excerpt?: string, published_at?: string }> }>} */
export function getBlogs() {
  return request('/blogs')
}

/** @param {string} slug */
export function getBlogBySlug(slug) {
  return request(`/blogs/${encodeURIComponent(slug)}`)
}
