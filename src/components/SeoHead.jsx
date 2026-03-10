import { useEffect } from 'react'

const DEFAULT_OG_IMAGE = '/logos/compresspdf.png'
const SITE_NAME = 'Compress PDF'

const META_NAMES = ['description', 'keywords', 'robots']
const META_PROPERTIES = [
  'og:title',
  'og:description',
  'og:image',
  'og:type',
  'og:url',
  'og:site_name',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
]

/**
 * Sets document title and meta tags for SEO (search + social).
 * Use ogType="article" for blog/article posts, "website" for pages and list views.
 * @param {{
 *   title?: string
 *   description?: string
 *   canonical?: string
 *   robots?: string
 *   ogTitle?: string
 *   ogDescription?: string
 *   ogImage?: string
 *   ogType?: 'website' | 'article'
 * }} props
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
  const siteTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const ogTitleFinal = ogTitle ?? title
  const ogDescFinal = ogDescription ?? description

  useEffect(() => {
    document.title = siteTitle

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const toAbsolute = (url) => {
      if (!url) return url
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`
    }

    const setMeta = (name, content, isProperty = false) => {
      if (content == null || content === '') return
      const attr = isProperty ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', String(content))
    }

    setMeta('description', description)
    setMeta('keywords', keywords)
    setMeta('robots', robots)
    setMeta('og:title', ogTitleFinal, true)
    setMeta('og:description', ogDescFinal, true)
    const ogImageUrl = ogImage ? toAbsolute(ogImage) : toAbsolute(DEFAULT_OG_IMAGE)
    setMeta('og:image', ogImageUrl, true)
    setMeta('og:type', ogType, true)
    setMeta('og:url', origin && typeof window !== 'undefined' ? window.location.href : '', true)
    setMeta('og:site_name', SITE_NAME, true)

    setMeta('twitter:card', 'summary_large_image', true)
    setMeta('twitter:title', ogTitleFinal, true)
    setMeta('twitter:description', ogDescFinal, true)
    setMeta('twitter:image', ogImageUrl, true)

    const canonicalHref = canonical
      ? toAbsolute(canonical)
      : origin && typeof window !== 'undefined'
        ? window.location.href.split('?')[0]
        : ''
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (canonicalHref) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link')
        canonicalEl.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalEl)
      }
      canonicalEl.setAttribute('href', canonicalHref)
    } else if (canonicalEl) {
      canonicalEl.remove()
    }

    return () => {
      META_NAMES.forEach((name) => {
        const el = document.querySelector(`meta[name="${name}"]`)
        if (el?.parentNode) el.parentNode.removeChild(el)
      })
      META_PROPERTIES.forEach((name) => {
        const el = document.querySelector(`meta[property="${name}"]`)
        if (el?.parentNode) el.parentNode.removeChild(el)
      })
      const link = document.querySelector('link[rel="canonical"]')
      if (link?.parentNode) link.parentNode.removeChild(link)
    }
  }, [siteTitle, description, keywords, robots, canonical, ogTitleFinal, ogDescFinal, ogImage, ogType])

  return null
}
