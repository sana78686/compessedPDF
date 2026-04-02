import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SeoHead } from './SeoHead'
import { getHomeSeo } from '../api/cms'
import { injectHeadSnippet } from '../utils/injectHeadSnippet'

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
 * Fetches home-page SEO from the CMS once, then re-applies it on every
 * navigation so tags are never left stale after a page-specific SeoHead unmounts.
 *
 * The `key` tied to `location.pathname` forces SeoHead to re-mount on every
 * route change, which re-runs its useEffect and re-injects the home SEO.
 * Page-specific SeoHeads (CmsPage, CmsBlog) mount AFTER this one in the React
 * tree, so their useEffect runs last and correctly overrides on non-home routes.
 */
export default function DynamicSeoHead() {
  const [seoData, setSeoData] = useState(DEFAULT_SEO)
  const [headSnippet, setHeadSnippet] = useState('')
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let isMounted = true
    const pathMatch = location.pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = pathMatch && pathMatch[1] ? pathMatch[1] : 'en'

    async function loadSeoData() {
      try {
        const data = await getHomeSeo(locale)
        if (isMounted) {
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
        }
      } catch (error) {
        console.warn('Failed to load SEO data from CMS, using defaults:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadSeoData()
    return () => { isMounted = false }
  }, [location.pathname])

  useEffect(() => {
    const nodes = injectHeadSnippet(headSnippet)
    return () => {
      nodes.forEach((n) => n.remove())
    }
  }, [headSnippet])

  if (loading) return null

  // key=location.pathname forces SeoHead to re-mount on every navigation.
  // This guarantees CMS meta tags are always re-injected when returning to any
  // route — even after a page-specific SeoHead's cleanup ran on the previous page.
  // Page-specific SeoHeads (deeper in the React tree) run their useEffect AFTER
  // this one and override correctly on pages that have their own SEO data.
  return (
    <SeoHead
      key={location.pathname}
      title={seoData.meta_title}
      description={seoData.meta_description}
      keywords={seoData.meta_keywords}
      robots={seoData.meta_robots}
      canonical={seoData.canonical_url}
      ogTitle={seoData.og_title}
      ogDescription={seoData.og_description}
      ogImage={seoData.og_image}
    />
  )
}
