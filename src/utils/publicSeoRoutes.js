/**
 * Routes where the global CMS home SEO (DynamicSeoHead) should apply.
 * All other routes use their page-level <SeoHead /> only — avoids home meta overwriting
 * blog, CMS pages, tools, legal, contact, etc.
 */
export function isCmsHomeSeoRoute(pathname) {
  if (!pathname || typeof pathname !== 'string') return false
  const p = pathname.replace(/\/+$/, '') || '/'
  if (p === '/') return true
  if (/^\/compress(\/result)?$/.test(p)) return true
  if (/^\/[a-z]{2}$/.test(p)) return true
  if (/^\/[a-z]{2}\/compress(\/result)?$/.test(p)) return true
  return false
}
