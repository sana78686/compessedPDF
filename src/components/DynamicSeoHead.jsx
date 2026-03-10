import { useEffect, useState } from 'react'
import { SeoHead } from './SeoHead'
import { getHomeSeo } from '../api/cms'

// Default SEO values as fallback
const DEFAULT_SEO = {
  meta_title: 'Compress PDF Files – Reduce File Size Online | Free PDF Compressor',
  meta_description: 'Compress PDF files online for free. Reduce PDF file size while optimizing for maximal quality. Fast, secure, client-side compression—no uploads required.',
  meta_keywords: 'compress PDF, reduce PDF size, PDF compressor, optimize PDF, free PDF compression',
  focus_keyword: 'compress PDF',
  og_title: 'Compress PDF',
  og_description: 'Compress PDF files online for free. Reduce PDF file size while optimizing for maximal quality. Fast, secure, client-side compression—no uploads required.',
  og_image: '/logos/compresspdf.png',
}

/**
 * Fetches SEO data from CMS and applies it using SeoHead component
 * Falls back to default values if CMS data is not available
 */
export default function DynamicSeoHead() {
  const [seoData, setSeoData] = useState(DEFAULT_SEO)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSeoData() {
      try {
        const data = await getHomeSeo()
        
        if (isMounted) {
          setSeoData({
            meta_title: data.meta_title || DEFAULT_SEO.meta_title,
            meta_description: data.meta_description || DEFAULT_SEO.meta_description,
            meta_keywords: data.meta_keywords || DEFAULT_SEO.meta_keywords,
            focus_keyword: data.focus_keyword || DEFAULT_SEO.focus_keyword,
            og_title: data.og_title || DEFAULT_SEO.og_title,
            og_description: data.og_description || DEFAULT_SEO.og_description,
            og_image: data.og_image || DEFAULT_SEO.og_image,
          })
        }
      } catch (error) {
        console.warn('Failed to load SEO data from CMS, using defaults:', error)
        // Keep default values on error
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadSeoData()

    return () => {
      isMounted = false
    }
  }, [])

  // Don't render anything until data is loaded to prevent flash
  if (loading) {
    return null
  }

  return (
    <SeoHead
      title={seoData.meta_title}
      description={seoData.meta_description}
      keywords={seoData.meta_keywords}
      ogTitle={seoData.og_title}
      ogDescription={seoData.og_description}
      ogImage={seoData.og_image}
    />
  )
}
