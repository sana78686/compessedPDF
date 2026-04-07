import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { buildLanguageAlternates, suffixFromPathname } from '../utils/hreflangForRoute'
import { isCmsHomeSeoRoute } from '../utils/publicSeoRoutes'

/** CMS page/blog detail: hreflang comes from API (alternate_locales) inside SeoHead — skip duplicates. */
function shouldSkipGlobalHreflang(pathname) {
  return /^\/[a-z]{2}\/(page|blog)\/[^/]+\/?$/.test(pathname || '')
}

/**
 * Injects &lt;link rel="alternate" hreflang="…"&gt; for the current URL pattern across all UI languages.
 * Home + compress routes are handled by DynamicSeoHead (same links, avoids double injection here).
 */
export default function HreflangLinks() {
  const location = useLocation()

  useEffect(() => {
    function removeInjected() {
      document.querySelectorAll('link[data-route-hreflang="1"]').forEach((n) => n.remove())
    }

    removeInjected()

    if (typeof document === 'undefined') return undefined
    if (isCmsHomeSeoRoute(location.pathname)) {
      return removeInjected
    }
    if (shouldSkipGlobalHreflang(location.pathname)) {
      return removeInjected
    }

    const origin = window.location.origin
    const suffix = suffixFromPathname(location.pathname)
    const alts = buildLanguageAlternates(origin, suffix)
    for (const { hreflang, href } of alts) {
      if (!hreflang || !href) continue
      const link = document.createElement('link')
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', hreflang)
      link.setAttribute('href', href)
      link.setAttribute('data-route-hreflang', '1')
      document.head.appendChild(link)
    }

    return removeInjected
  }, [location.pathname])

  return null
}
