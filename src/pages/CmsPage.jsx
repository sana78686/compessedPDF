import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPageBySlug } from '../api/cms'
import { SeoHead } from '../components/SeoHead'
import { getPreferredLang, supportedLangs } from '../i18n/translations'
import { buildHreflangAlternates } from '../utils/seoHreflang'
import './CmsPage.css'

export default function CmsPage() {
  const { lang, slug } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    getPageBySlug(slug, lang)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug, lang])

  useEffect(() => {
    const redir = data?._seo_redirect
    if (!redir?.locale || !redir?.slug) return
    navigate(`/${redir.locale}/page/${encodeURIComponent(redir.slug)}`, { replace: true })
  }, [data, navigate])

  const alternateLocalesKey = Array.isArray(data?.alternate_locales)
    ? [...data.alternate_locales].sort().join(',')
    : ''
  const hreflangAlternates = useMemo(() => {
    if (!data || data._seo_redirect || error) return null
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const alt = buildHreflangAlternates(data.slug || slug, data.alternate_locales, 'page', origin)
    return alt.length ? alt : null
  }, [data, error, slug, alternateLocalesKey])

  const langPrefix = supportedLangs.includes(lang) ? lang : getPreferredLang()

  if (loading) {
    return (
      <div className="cms-page wrap">
        <p className="cms-page-loading">Loading…</p>
      </div>
    )
  }

  if (data?._seo_redirect) {
    return (
      <div className="cms-page wrap">
        <p className="cms-page-loading">Redirecting…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="cms-page wrap">
        <SeoHead title="Page not found" />
        <p className="cms-page-error">{error || 'Page not found.'}</p>
        <Link to={`/${langPrefix}`} className="cms-page-back">← Back to home</Link>
      </div>
    )
  }

  return (
    <article className="cms-page wrap">
        <SeoHead
          title={data.meta_title || data.title}
          description={data.meta_description}
          canonical={data.canonical_url}
          robots={data.meta_robots}
          ogTitle={data.og_title}
          ogDescription={data.og_description}
          ogImage={data.og_image}
          hreflangAlternates={hreflangAlternates}
        />
        <header className="cms-page-header">
          <h1 className="cms-page-title">{data.title}</h1>
        </header>
        <div
          className="cms-page-content"
          dangerouslySetInnerHTML={{ __html: data.content || '' }}
        />
        <footer className="cms-page-footer">
          <Link to={`/${langPrefix}`} className="cms-page-back">
            ← Back to home
          </Link>
        </footer>
      </article>
  )
}
