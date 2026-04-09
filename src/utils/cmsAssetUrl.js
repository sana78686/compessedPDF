import { CMS_API_BASE, CMS_SITE_DOMAIN, normalizeSiteDomain } from '../config/cms'

/** Dev / emergency: use CMS API media proxy (URLs contain the CMS host). */
const USE_LEGACY_CMS_MEDIA_PROXY = import.meta.env.VITE_USE_CMS_MEDIA_PROXY === 'true'

function apiHostname() {
  try {
    return new URL(CMS_API_BASE).hostname.toLowerCase()
  } catch {
    return ''
  }
}

/** Match cms.js: tenant domain segment for /{domain}/api/public/... */
function resolveSiteDomainForMedia() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const h = normalizeSiteDomain(window.location.hostname)
    if (h === 'localhost' || h === '127.0.0.1') {
      return normalizeSiteDomain(CMS_SITE_DOMAIN)
    }
    return h
  }
  return normalizeSiteDomain(CMS_SITE_DOMAIN)
}

function encodePathSegments(rel) {
  return String(rel || '')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((p) => encodeURIComponent(p))
    .join('/')
}

/**
 * Legacy: public API URL that streams files from CMS (no friendly domain).
 * @param {string} storageRelativePath - e.g. uploads/editor/file.png
 */
export function publicMediaProxyUrl(storageRelativePath) {
  const rel = String(storageRelativePath || '').replace(/^\/+/, '').replace(/\/+$/, '')
  if (!rel) return ''
  const site = resolveSiteDomainForMedia()
  const base = String(CMS_API_BASE).replace(/\/$/, '')
  return `${base}/${site}/api/public/media?path=${encodeURIComponent(rel)}`
}

function storageRelativePathFromUrl(urlString) {
  const s = String(urlString || '').trim()
  if (!s) return null
  if (s.startsWith('/storage/')) {
    return s.replace(/^\/storage\//, '').replace(/^\/+/, '')
  }
  try {
    const u = new URL(s)
    const host = u.hostname.toLowerCase()
    if (host !== apiHostname()) return null
    const p = u.pathname || ''
    if (!p.startsWith('/storage/')) return null
    return p.replace(/^\/storage\//, '').replace(/^\/+/, '')
  } catch {
    return null
  }
}

/**
 * Image URL for the live React site: same origin /uploads/... (nginx proxies to CMS /storage).
 * CMS + API return https://{frontend}/uploads/editor/... when Domain.frontend_url is set.
 */
export function resolveCmsMediaUrl(url) {
  if (url == null || url === '') return ''
  const s = String(url).trim()
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : ''

  if (/^https?:\/\//i.test(s) || s.startsWith('//')) {
    try {
      const u = new URL(s.startsWith('//') ? `https:${s}` : s)
      if (origin && u.origin === new URL(origin).origin) {
        return u.pathname + (u.search || '')
      }
    } catch {
      /* continue */
    }

    const rel = storageRelativePathFromUrl(s)
    if (rel) {
      if (USE_LEGACY_CMS_MEDIA_PROXY) {
        return publicMediaProxyUrl(rel)
      }
      if (origin) {
        return `${origin}/${encodePathSegments(rel)}`
      }
      return publicMediaProxyUrl(rel)
    }
    try {
      const u = new URL(s.startsWith('//') ? `https:${s}` : s)
      if (u.pathname.startsWith('/cms-uploads/')) {
        const relCms = u.pathname.replace(/^\/+/, '')
        return publicMediaProxyUrl(relCms)
      }
    } catch {
      /* keep raw URL */
    }
    return s
  }

  const path = s.startsWith('/') ? s : `/${s}`
  if (path.startsWith('/uploads/')) {
    return origin ? `${origin}${path}` : path
  }
  if (path.startsWith('/cms-uploads/')) {
    const relCms = path.replace(/^\/+/, '')
    return publicMediaProxyUrl(relCms)
  }
  if (path.startsWith('/storage/')) {
    const inner = path.replace(/^\/storage\//, '').replace(/^\/+/, '')
    if (USE_LEGACY_CMS_MEDIA_PROXY) {
      return publicMediaProxyUrl(inner)
    }
    return origin ? `${origin}/${encodePathSegments(inner)}` : publicMediaProxyUrl(inner)
  }
  if (path.startsWith('/media/')) {
    const base = String(CMS_API_BASE).replace(/\/$/, '')
    return `${base}${path}`
  }
  if (path.startsWith('/')) {
    return origin ? `${origin}${path}` : path
  }
  return path
}

/**
 * Fix rich-text HTML: storage URLs → same-origin /uploads/...
 */
export function absolutizeCmsHtml(html) {
  if (!html || typeof html !== 'string') return html
  return html.replace(
    /\b(src|href)=(["'])((?:https?:\/\/[^"']+)?\/(?:storage|media|cms-uploads)\/[^"']+)\2/gi,
    (_, attr, q, urlPart) => {
      const resolved = resolveCmsMediaUrl(urlPart)
      return `${attr}=${q}${resolved}${q}`
    },
  )
}
