import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPageBySlug } from '../api/cms'
import { SeoHead } from '../components/SeoHead'
import JsonLd from '../components/JsonLd'
import { getPreferredLang, supportedLangs, langToOgLocale, langPrefix } from '../i18n/translations'
import { useLang } from '../hooks/useLang'
import { buildHreflangAlternates } from '../utils/seoHreflang'
import { absolutizeCmsHtml } from '../utils/cmsAssetUrl'
import './CmsPage.css'

function plainText(html) {
  if (!html || typeof html !== 'string') return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function CmsPage() {
  const { slug } = useParams()
  const lang = useLang()
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
    navigate(`${langPrefix(redir.locale)}/page/${encodeURIComponent(redir.slug)}`, { replace: true })
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

  const lp = supportedLangs.includes(lang) ? lang : getPreferredLang()
  const fallbackTitle = String(data?.title || '').trim()
  const fallbackDescription = plainText(data?.content).slice(0, 160)

  if (loading) {
    return (
      <div className="cms-page wrap">
        <SeoHead title="Loading…" robots="noindex" />
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
        <SeoHead title="" />
        <p className="cms-page-error">{error || 'Page not found.'}</p>
        <Link to={`${langPrefix(lp)}/`} className="cms-page-back">← Back to home</Link>
      </div>
    )
  }

  return (
    <article className="cms-page wrap">
        <JsonLd data={data?.json_ld} />
        <SeoHead
          title={(data.meta_title || fallbackTitle || '').trim()}
          description={(data.meta_description || fallbackDescription || '').trim()}
          keywords={data.meta_keywords || ''}
          canonical={data.canonical_url}
          robots={(data.meta_robots || 'index,follow').trim()}
          ogTitle={(data.og_title || data.meta_title || fallbackTitle || '').trim()}
          ogDescription={(data.og_description || data.meta_description || fallbackDescription || '').trim()}
          ogImage={data.og_image}
          ogLocale={langToOgLocale(lang)}
          hreflangAlternates={hreflangAlternates}
        />
        <header className="cms-page-header">
          <nav className="cms-page-breadcrumb" aria-label="Breadcrumb">
            <Link to={`${langPrefix(lang)}/`}>Home</Link>
            <span aria-hidden="true"> / </span>
            <span>{data.title}</span>
          </nav>
          <h1 className="cms-page-title">{data.title}</h1>
        </header>
        <div
          className="cms-page-content"
          dangerouslySetInnerHTML={{ __html: absolutizeCmsHtml(data.content || '') }}
        />
        <footer className="cms-page-footer">
          <Link to={`${langPrefix(lang)}/`} className="cms-page-back">
            ← Back to home
          </Link>
        </footer>
      </article>
  )
}
