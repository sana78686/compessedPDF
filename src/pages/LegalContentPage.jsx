import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLegalPage } from '../api/cms'
import { SeoHead } from '../components/SeoHead'
import { getPreferredLang, supportedLangs } from '../i18n/translations'
import './CmsPage.css'

const VALID_SLUGS = ['terms', 'privacy-policy', 'disclaimer', 'about-us', 'cookie-policy']

export default function LegalContentPage() {
  const { lang, slug } = useParams()
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
    getLegalPage(slug)
      .then(setData)
      .catch(() => setError('Page not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  const langPrefix = supportedLangs.includes(lang) ? lang : getPreferredLang()

  if (loading) {
    return (
      <div className="cms-page wrap">
        <p className="cms-page-loading">Loading…</p>
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
      <SeoHead title={data.title} description={data.title} />
      <header className="cms-page-header">
        <h1 className="cms-page-title">{data.title}</h1>
      </header>
      <div
        className="cms-page-content legal-content-body"
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
