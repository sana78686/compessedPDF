import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBlogBySlug } from '../api/cms'
import { SeoHead } from '../components/SeoHead'
import SiteLayout from '../components/SiteLayout'
import { getPreferredLang, supportedLangs } from '../i18n/translations'
import './CmsPage.css'

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: 'long',
    })
  } catch {
    return iso
  }
}

export default function CmsBlog() {
  const { lang, slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    getBlogBySlug(slug)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  const langPrefix = supportedLangs.includes(lang) ? lang : getPreferredLang()

  if (loading) {
    return (
      <SiteLayout>
        <div className="cms-page wrap">
          <p className="cms-page-loading">Loading…</p>
        </div>
      </SiteLayout>
    )
  }

  if (error || !data) {
    return (
      <SiteLayout>
        <div className="cms-page wrap">
          <SeoHead title="Post not found" />
          <p className="cms-page-error">{error || 'Post not found.'}</p>
          <Link to={`/${langPrefix}`} className="cms-page-back">← Back to home</Link>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <article className="cms-page wrap">
      <SeoHead
        title={data.meta_title || data.title}
        description={data.meta_description || data.excerpt}
        ogTitle={data.og_title}
        ogDescription={data.og_description}
        ogImage={data.og_image}
      />
      <header className="cms-page-header">
        <h1 className="cms-page-title">{data.title}</h1>
        {data.published_at && (
          <time className="cms-page-date" dateTime={data.published_at}>
            {formatDate(data.published_at)}
          </time>
        )}
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
    </SiteLayout>
  )
}
