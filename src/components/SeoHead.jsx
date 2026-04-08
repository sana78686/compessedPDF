import { useEffect, useRef } from 'react'
import { resolveCmsMediaUrl } from '../utils/cmsAssetUrl'

function trimStr(v) {
  if (v == null) return ''
  return String(v).trim()
}

function removeMeta(attr, name) {
  const el = document.querySelector(`meta[${attr}="${name}"]`)
  if (el?.parentNode) el.parentNode.removeChild(el)
}

/**
 * Sets document title and meta tags for SEO (search + social).
 * No hardcoded site title or OG image: empty CMS fields stay empty unless you pass values.
 *
 * @param {{ title?, description?, keywords?, canonical?, robots?, ogTitle?, ogDescription?, ogImage?, ogType?, appendBrandSuffix?, brandSuffix?, siteName?, hreflangAlternates? }} props
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
  appendBrandSuffix = false,
  brandSuffix = '',
  siteName,
  hreflangAlternates = null,
}) {
  const t = trimStr(title)
  const siteNameResolved =
    siteName !== undefined
      ? trimStr(siteName)
      : trimStr(
          typeof import.meta.env.VITE_PUBLIC_SITE_NAME === 'string'
            ? import.meta.env.VITE_PUBLIC_SITE_NAME
            : '',
        )
  const suffix = trimStr(brandSuffix)
  const documentTitle = appendBrandSuffix && t && suffix ? `${t} | ${suffix}` : t

  const ogTitleFinal =
    ogTitle !== undefined && ogTitle !== null ? trimStr(ogTitle) || t : t
  const ogDescFinal =
    ogDescription !== undefined && ogDescription !== null
      ? trimStr(ogDescription) || trimStr(description)
      : trimStr(description)

  const ownedEls = useRef([])
  const ownedCanonical = useRef(false)
  const ownedHreflangs = useRef([])

  useEffect(() => {
    document.title = documentTitle

    const origin = typeof window !== 'undefined' ? window.location.origin : ''

    const toAbsolute = (url) => {
      if (!url) return url
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`
    }

    const created = []

    const setOrRemoveMeta = (name, content, isProperty = false) => {
      const c = trimStr(content)
      const attr = isProperty ? 'property' : 'name'
      if (!c) {
        removeMeta(attr, name)
        return
      }
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
        created.push(el)
      }
      el.setAttribute('content', c)
    }

    setOrRemoveMeta('title', documentTitle)
    setOrRemoveMeta('description', description)
    setOrRemoveMeta('keywords', keywords)
    setOrRemoveMeta('robots', robots)

    setOrRemoveMeta('og:title', ogTitleFinal, true)
    setOrRemoveMeta('og:description', ogDescFinal, true)
    const resolvedImg = trimStr(ogImage) ? resolveCmsMediaUrl(ogImage) : ''
    const ogImageUrl = resolvedImg ? toAbsolute(resolvedImg) : ''
    setOrRemoveMeta('og:image', ogImageUrl, true)
    setOrRemoveMeta('og:type', ogType, true)
    setOrRemoveMeta('og:url', origin && typeof window !== 'undefined' ? window.location.href : '', true)
    setOrRemoveMeta('og:site_name', siteNameResolved, true)

    if (ogTitleFinal || ogDescFinal || ogImageUrl) {
      setOrRemoveMeta(
        'twitter:card',
        ogImageUrl ? 'summary_large_image' : 'summary',
        false,
      )
      setOrRemoveMeta('twitter:title', ogTitleFinal, false)
      setOrRemoveMeta('twitter:description', ogDescFinal, false)
      setOrRemoveMeta('twitter:image', ogImageUrl, false)
    } else {
      removeMeta('name', 'twitter:card')
      removeMeta('name', 'twitter:title')
      removeMeta('name', 'twitter:description')
      removeMeta('name', 'twitter:image')
    }

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
      ownedEls.current.forEach((el) => el?.parentNode?.removeChild(el))
      ownedEls.current = []
      if (ownedCanonical.current) {
        const link = document.querySelector('link[rel="canonical"]')
        if (link?.parentNode) link.parentNode.removeChild(link)
        ownedCanonical.current = false
      }
    }
  }, [
    documentTitle,
    description,
    keywords,
    robots,
    canonical,
    ogTitleFinal,
    ogDescFinal,
    ogImage,
    ogType,
    siteNameResolved,
  ])

  useEffect(() => {
    ownedHreflangs.current.forEach((el) => el?.parentNode?.removeChild(el))
    ownedHreflangs.current = []
    if (!hreflangAlternates?.length || typeof document === 'undefined') return
    const created = []
    for (const { hreflang, href } of hreflangAlternates) {
      if (!hreflang || !href) continue
      const link = document.createElement('link')
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', hreflang)
      link.setAttribute('href', href)
      document.head.appendChild(link)
      created.push(link)
    }
    ownedHreflangs.current = created
    return () => {
      ownedHreflangs.current.forEach((el) => el?.parentNode?.removeChild(el))
      ownedHreflangs.current = []
    }
  }, [hreflangAlternates])

  return null
}
