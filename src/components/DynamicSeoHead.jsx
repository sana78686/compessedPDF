import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SeoHead } from './SeoHead'
import { getHomeSeo } from '../api/cms'
import { defaultLang } from '../i18n/translations'
import { injectHeadSnippet } from '../utils/injectHeadSnippet'
import { headSnippetReferencesGaId, injectGa4 } from '../utils/injectGa4'
import { isCmsHomeSeoRoute } from '../utils/publicSeoRoutes'
import { buildLanguageAlternates, suffixFromPathname } from '../utils/hreflangForRoute'

const envGaFallback = (typeof import.meta.env.VITE_GA_MEASUREMENT_ID === 'string'
  ? import.meta.env.VITE_GA_MEASUREMENT_ID
  : '').trim()

// Default SEO values as fallback
const DEFAULT_SEO = {
  meta_title:       'Compress PDF Files – Reduce File Size Online | Free PDF Compressor',
  meta_description: 'Compress PDF files online for free. Reduce PDF file size while optimizing for maximal quality. Fast, secure, client-side compression—no uploads required.',
  meta_keywords:    'compress PDF, reduce PDF size, PDF compressor, optimize PDF, free PDF compression',
  focus_keyword:    'compress PDF',
  og_title:         'Compress PDF',
  og_description:   'Compress PDF files online for free. Reduce PDF file size while optimizing for maximal quality. Fast, secure, client-side compression—no uploads required.',
  og_image:         '/logos/compresspdf.png',
  meta_robots:      'index,follow',
  canonical_url:    '',
}

/**
 * Loads home SEO + optional `head_snippet` and GA4 ID from the CMS public API
 * (`/home-content`) and injects them into document.head for crawlers and analytics.
 *
 * Where to configure in CMS:
 *  - Content Manager → Home → “Frontend &lt;head&gt; snippet” (meta verification, GTM, custom scripts)
 *  - SEO → Analytics → GA4 Measurement ID (injects gtag unless the same ID is already in the snippet)
 *
 * Dev fallback: `VITE_GA_MEASUREMENT_ID` in `.env` when the API has no ID.
 */
export default function DynamicSeoHead() {
  const [seoData, setSeoData] = useState(DEFAULT_SEO)
  const [headSnippet, setHeadSnippet] = useState('')
  const [gaMeasurementId, setGaMeasurementId] = useState(envGaFallback)
  const location = useLocation()

  useEffect(() => {
    let isMounted = true
    const pathMatch = location.pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = pathMatch && pathMatch[1] ? pathMatch[1] : defaultLang

    async function loadSeoData() {
      try {
        const data = await getHomeSeo(locale)
        if (!isMounted) return
        setSeoData({
          meta_title:       data.meta_title       || DEFAULT_SEO.meta_title,
          meta_description: data.meta_description || DEFAULT_SEO.meta_description,
          meta_keywords:    data.meta_keywords    || DEFAULT_SEO.meta_keywords,
          focus_keyword:    data.focus_keyword    || DEFAULT_SEO.focus_keyword,
          og_title:         data.og_title         || DEFAULT_SEO.og_title,
          og_description:   data.og_description   || DEFAULT_SEO.og_description,
          og_image:         data.og_image         || DEFAULT_SEO.og_image,
          meta_robots:      data.meta_robots      || DEFAULT_SEO.meta_robots,
          canonical_url:    data.canonical_url    || DEFAULT_SEO.canonical_url,
        })
        setHeadSnippet(typeof data.head_snippet === 'string' ? data.head_snippet : '')
        const cmsGa = typeof data.ga_measurement_id === 'string' ? data.ga_measurement_id.trim() : ''
        setGaMeasurementId(cmsGa || envGaFallback)
      } catch (error) {
        console.warn('Failed to load SEO data from CMS, using defaults:', error)
      }
    }

    loadSeoData()
    return () => { isMounted = false }
  }, [location.pathname])

  // Defer third-party / CMS head scripts until idle so Lighthouse TBT and main-thread work improve.
  useEffect(() => {
    let cancelled = false
    const injected = []
    const run = () => {
      if (cancelled) return
      injected.push(...injectHeadSnippet(headSnippet))
      const skipGa = headSnippetReferencesGaId(headSnippet, gaMeasurementId)
      if (gaMeasurementId && !skipGa) {
        injected.push(...injectGa4(gaMeasurementId))
      }
    }
    let idleId
    let timeoutId
    if (typeof requestIdleCallback !== 'undefined') {
      idleId = requestIdleCallback(run, { timeout: 2500 })
    } else {
      timeoutId = window.setTimeout(run, 1)
    }
    return () => {
      cancelled = true
      if (idleId !== undefined && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
      injected.forEach((n) => n.remove())
    }
  }, [headSnippet, gaMeasurementId])

  const homeHreflangAlternates = useMemo(() => {
    if (typeof window === 'undefined') return null
    if (!isCmsHomeSeoRoute(location.pathname)) return null
    const suffix = suffixFromPathname(location.pathname)
    return buildLanguageAlternates(window.location.origin, suffix)
  }, [location.pathname])

  if (!isCmsHomeSeoRoute(location.pathname)) {
    return null
  }

  return (
    <SeoHead
      key={location.pathname}
      appendBrandSuffix={false}
      title={seoData.meta_title}
      description={seoData.meta_description}
      keywords={seoData.meta_keywords}
      robots={seoData.meta_robots}
      canonical={seoData.canonical_url}
      ogTitle={seoData.og_title}
      ogDescription={seoData.og_description}
      ogImage={seoData.og_image}
      hreflangAlternates={homeHreflangAlternates}
    />
  )
}
