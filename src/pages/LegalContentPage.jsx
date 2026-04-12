import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLegalPage } from '../api/cms'
import JsonLd from '../components/JsonLd'
import { SeoHead } from '../components/SeoHead'
import { absolutizeCmsHtml } from '../utils/cmsAssetUrl'
import { getPreferredLang, supportedLangs, langToOgLocale, langPrefix } from '../i18n/translations'
import { useLang } from '../hooks/useLang'
import './CmsPage.css'

const VALID_SLUGS = ['terms', 'privacy-policy', 'disclaimer', 'about-us', 'cookie-policy']

function plainText(html) {
  if (!html || typeof html !== 'string') return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function LegalContentPage() {
  const { slug } = useParams()
  const lang = useLang()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug || !VALID_SLUGS.includes(slug)) {
      setError('Page not found.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getLegalPage(slug, lang)
      .then(setData)
      .catch(() => setError('Page not found.'))
      .finally(() => setLoading(false))
  }, [slug, lang])

  const lp = supportedLangs.includes(lang) ? lang : getPreferredLang()

  if (loading) {
    return (
      <div className="cms-page wrap">
        <SeoHead title="Loading…" robots="noindex" />
        <p className="cms-page-loading">Loading…</p>
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
      <SeoHead
        title={data.title || ''}
        description={plainText(data.content || '').slice(0, 160)}
        robots="index,follow"
        ogTitle={data.title || ''}
        ogDescription={plainText(data.content || '').slice(0, 160)}
        ogLocale={langToOgLocale(lang)}
      />
      <JsonLd data={data.json_ld} />
      <header className="cms-page-header">
        <h1 className="cms-page-title">{data.title}</h1>
      </header>
      <div
        className="cms-page-content legal-content-body"
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
