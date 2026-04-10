import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SeoHead } from './SeoHead'
import { getHomeSeo } from '../api/cms'
import { defaultLang, langToOgLocale } from '../i18n/translations'
import { injectHeadSnippet } from '../utils/injectHeadSnippet'
import { headSnippetReferencesGaId, injectGa4 } from '../utils/injectGa4'
import { isCmsHomeSeoRoute } from '../utils/publicSeoRoutes'
import { buildLanguageAlternates, suffixFromPathname } from '../utils/hreflangForRoute'

const envGaFallback = (typeof import.meta.env.VITE_GA_MEASUREMENT_ID === 'string'
  ? import.meta.env.VITE_GA_MEASUREMENT_ID
  : '').trim()

const EMPTY_SEO = {
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  focus_keyword: '',
  og_title: '',
  og_description: '',
  og_image: '',
  meta_robots: '',
  canonical_url: '',
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
  const [seoData, setSeoData] = useState(EMPTY_SEO)
  const [headSnippet, setHeadSnippet] = useState('')
  const [gaMeasurementId, setGaMeasurementId] = useState(envGaFallback)
  const location = useLocation()

  const pathMatch = location.pathname.match(/^\/([a-z]{2})(\/|$)/)
  const locale = (pathMatch?.[1] && ['id', 'en'].includes(pathMatch[1])) ? pathMatch[1] : defaultLang
  const isHomeRoute = isCmsHomeSeoRoute(location.pathname)

  useEffect(() => {
    if (!isHomeRoute) return
    let isMounted = true

    async function loadSeoData() {
      try {
        const data = await getHomeSeo(locale)
        if (!isMounted) return
        setSeoData({
          meta_title: typeof data.meta_title === 'string' ? data.meta_title : '',
          meta_description: typeof data.meta_description === 'string' ? data.meta_description : '',
          meta_keywords: typeof data.meta_keywords === 'string' ? data.meta_keywords : '',
          focus_keyword: typeof data.focus_keyword === 'string' ? data.focus_keyword : '',
          og_title: typeof data.og_title === 'string' ? data.og_title : '',
          og_description: typeof data.og_description === 'string' ? data.og_description : '',
          og_image: typeof data.og_image === 'string' ? data.og_image : '',
          meta_robots: typeof data.meta_robots === 'string' ? data.meta_robots : '',
          canonical_url: typeof data.canonical_url === 'string' ? data.canonical_url : '',
        })
        setHeadSnippet(typeof data.head_snippet === 'string' ? data.head_snippet : '')
        const cmsGa = typeof data.ga_measurement_id === 'string' ? data.ga_measurement_id.trim() : ''
        setGaMeasurementId(cmsGa || envGaFallback)
      } catch (err) {
        console.warn('Failed to load SEO data from CMS:', err)
        if (!isMounted) return
        setSeoData(EMPTY_SEO)
        setHeadSnippet('')
        setGaMeasurementId(envGaFallback)
      }
    }

    loadSeoData()
    return () => { isMounted = false }
  }, [isHomeRoute, locale])

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
    if (!isHomeRoute) return null
    const suffix = suffixFromPathname(location.pathname)
    return buildLanguageAlternates(window.location.origin, suffix)
  }, [isHomeRoute, location.pathname])

  if (!isHomeRoute) {
    return null
  }

  const robots =
    seoData.meta_robots && String(seoData.meta_robots).trim()
      ? String(seoData.meta_robots).trim()
      : 'index, follow'

  return (
    <SeoHead
      key={location.pathname}
      appendBrandSuffix={false}
      title={seoData.meta_title}
      description={seoData.meta_description}
      keywords={seoData.meta_keywords}
      robots={robots}
      canonical={seoData.canonical_url}
      ogTitle={seoData.og_title}
      ogDescription={seoData.og_description}
      ogImage={seoData.og_image}
      ogLocale={langToOgLocale(locale)}
      hreflangAlternates={homeHreflangAlternates}
    />
  )
}
