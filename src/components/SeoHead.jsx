import { useEffect } from 'react'

/**
 * Sets document title and meta tags for SEO (search + social).
 * @param {{
 *   title?: string
 *   description?: string
 *   canonical?: string
 *   robots?: string
 *   ogTitle?: string
 *   ogDescription?: string
 *   ogImage?: string
 * }} props
 */
export function SeoHead({
  title = '',
  description = '',
  canonical = '',
  robots = 'index, follow',
  ogTitle,
  ogDescription,
  ogImage,
}) {
  const siteTitle = title ? `${title} | Compress PDF` : 'Compress PDF'
  const ogTitleFinal = ogTitle ?? title
  const ogDescFinal = ogDescription ?? description

  useEffect(() => {
    document.title = siteTitle

    const setMeta = (name, content, isProperty = false) => {
      if (!content) return
      const attr = isProperty ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', description)
    setMeta('robots', robots)
    setMeta('og:title', ogTitleFinal, true)
    setMeta('og:description', ogDescFinal, true)
    setMeta('og:image', ogImage, true)
    setMeta('og:type', 'website', true)

    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link')
        canonicalEl.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalEl)
      }
      canonicalEl.setAttribute('href', canonical)
    } else if (canonicalEl) {
      canonicalEl.remove()
    }
  }, [siteTitle, description, robots, canonical, ogTitleFinal, ogDescFinal, ogImage])

  return null
}
