import { useEffect, useMemo } from 'react'

/**
 * Injects one JSON-LD &lt;script type="application/ld+json"&gt; into document.head.
 * Removes it on unmount or when the payload changes (SPA-safe).
 *
 * @param {{ '@context'?: string, '@graph'?: unknown[] } | null | undefined} data
 */
export default function JsonLd({ data }) {
  const serialized = useMemo(() => {
    if (!data || !Array.isArray(data['@graph']) || data['@graph'].length === 0) {
      return ''
    }
    try {
      return JSON.stringify(data)
    } catch {
      return ''
    }
  }, [data])

  useEffect(() => {
    if (!serialized) {
      return undefined
    }
    // seo-prerender.php injects JSON-LD into the HTML shell so View Source matches crawlers; skip duplicate client injection.
    if (typeof document !== 'undefined') {
      const ssr = document.querySelector('script[type="application/ld+json"][data-cms-seo-prerender="1"]')
      if (ssr) {
        return undefined
      }
    }
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-cms-json-ld', '1')
    el.textContent = serialized
    document.head.appendChild(el)
    return () => {
      el.remove()
    }
  }, [serialized])

  return null
}
