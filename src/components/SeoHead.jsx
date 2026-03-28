import { useEffect, useRef } from 'react'

const DEFAULT_OG_IMAGE = '/logos/compresspdf.png'
const SITE_NAME = 'Compress PDF'

/**
 * Sets document title and meta tags for SEO (search + social).
 *
 * Design rules:
 *  - Only removes elements that THIS instance created (tracked via ownedEls ref).
 *    Elements that already existed in the DOM before this instance ran are
 *    updated in-place and left alone on unmount, so navigating between pages
 *    never wipes tags that another SeoHead will immediately restore.
 *  - The last SeoHead to mount wins for any given tag.
 *  - Use ogType="article" for blog/article posts, "website" for pages.
 *
 * @param {{ title, description, keywords, canonical, robots, ogTitle, ogDescription, ogImage, ogType }} props
 */
export function SeoHead({
  title = '',
  description = '',
  keywords = '',
  canonical = '',
  robots = 'index, follow',
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
}) {
  const siteTitle    = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const ogTitleFinal = ogTitle ?? title
  const ogDescFinal  = ogDescription ?? description

  // Track only the elements WE created so cleanup is surgical, not global.
  const ownedEls       = useRef([])
  const ownedCanonical = useRef(false)

  useEffect(() => {
    document.title = siteTitle

    const origin = typeof window !== 'undefined' ? window.location.origin : ''

    const toAbsolute = (url) => {
      if (!url) return url
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`
    }

    const created = []

    const setMeta = (name, content, isProperty = false) => {
      if (content == null || content === '') return
      const attr = isProperty ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
        created.push(el)
      }
      el.setAttribute('content', String(content))
    }

    setMeta('description', description)
    setMeta('keywords', keywords)
    setMeta('robots', robots)
    setMeta('og:title',        ogTitleFinal, true)
    setMeta('og:description',  ogDescFinal,  true)
    const ogImageUrl = ogImage ? toAbsolute(ogImage) : toAbsolute(DEFAULT_OG_IMAGE)
    setMeta('og:image',     ogImageUrl, true)
    setMeta('og:type',      ogType,     true)
    setMeta('og:url',       origin && typeof window !== 'undefined' ? window.location.href : '', true)
    setMeta('og:site_name', SITE_NAME,  true)
    setMeta('twitter:card',        'summary_large_image', true)
    setMeta('twitter:title',       ogTitleFinal,          true)
    setMeta('twitter:description', ogDescFinal,           true)
    setMeta('twitter:image',       ogImageUrl,            true)

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    const canonicalHref = canonical
      ? toAbsolute(canonical)
      : origin && typeof window !== 'undefined'
        ? window.location.href.split('?')[0]
        : ''
    if (canonicalHref) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link')
        canonicalEl.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalEl)
        ownedCanonical.current = true
      }
      canonicalEl.setAttribute('href', canonicalHref)
    } else if (canonicalEl && ownedCanonical.current) {
      canonicalEl.remove()
      ownedCanonical.current = false
    }

    ownedEls.current = created

    return () => {
      // Only remove elements this instance created — never touch elements
      // that were already in the DOM (they will be updated by the next SeoHead).
      ownedEls.current.forEach((el) => el?.parentNode?.removeChild(el))
      ownedEls.current = []
      if (ownedCanonical.current) {
        const link = document.querySelector('link[rel="canonical"]')
        if (link?.parentNode) link.parentNode.removeChild(link)
        ownedCanonical.current = false
      }
    }
  }, [siteTitle, description, keywords, robots, canonical, ogTitleFinal, ogDescFinal, ogImage, ogType])

  return null
}
