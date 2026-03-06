import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBlogBySlug } from '../api/cms'
import { SeoHead } from '../components/SeoHead'
import { useTranslation } from '../i18n/useTranslation'
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

function formatShortDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function CmsBlog() {
  const { lang, slug } = useParams()
  const t = useTranslation(lang)
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
      <div className="cms-page wrap">
        <p className="cms-page-loading">Loading…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="cms-page wrap">
        <SeoHead title="Post not found" />
        <p className="cms-page-error">{error || 'Post not found.'}</p>
        <Link to={`/${langPrefix}`} className="cms-page-back">← Back to home</Link>
      </div>
    )
  }

  const heroImage = data.og_image || data.image
  const authorName = data.author?.name

  return (
    <article className="cms-page cms-blog wrap">
      <SeoHead
        title={data.meta_title || data.title}
        description={data.meta_description || data.excerpt}
        canonical={data.canonical_url}
        robots={data.meta_robots}
        ogTitle={data.og_title}
        ogDescription={data.og_description}
        ogImage={heroImage}
        ogType="article"
      />
      <header className="cms-blog-header">
        <h1 className="cms-blog-title">{data.title}</h1>
        <dl className="cms-blog-meta">
          {data.published_at && (
            <div className="cms-blog-meta-row">
              <dt>Published on</dt>
              <dd>
                <time dateTime={data.published_at}>{formatShortDate(data.published_at)}</time>
              </dd>
            </div>
          )}
          {data.updated_at && (
            <div className="cms-blog-meta-row">
              <dt>Updated on</dt>
              <dd>
                <time dateTime={data.updated_at}>{formatShortDate(data.updated_at)}</time>
              </dd>
            </div>
          )}
          <div className="cms-blog-meta-row">
            <dt>Author</dt>
            <dd>{authorName || 'No Author'}</dd>
          </div>
          <div className="cms-blog-meta-row">
            <dt>Category</dt>
            <dd>{data.category || 'No Category'}</dd>
          </div>
          <div className="cms-blog-meta-row">
            <dt>Tags</dt>
            <dd>
              {Array.isArray(data.tags) ? data.tags.join(', ') : typeof data.tags === 'string' ? data.tags : 'No Tags'}
            </dd>
          </div>
        </dl>
        {heroImage && (
          <div className="cms-blog-hero">
            <img src={heroImage} alt={data.title ? `Featured image for ${data.title}` : 'Blog featured image'} className="cms-blog-hero-img" loading="eager" decoding="async" />
          </div>
        )}
        {!heroImage && (
          <div className="cms-blog-hero cms-blog-hero-placeholder" aria-hidden="true">
            <span className="cms-blog-hero-placeholder-text">Featured image</span>
          </div>
        )}
      </header>
      <div
        className="cms-page-content cms-blog-content"
        dangerouslySetInnerHTML={{ __html: data.content || '' }}
      />
      <footer className="cms-page-footer">
        <Link to={`/${langPrefix}/blog`} className="cms-page-back">
          ← {t('blog.backToBlog')}
        </Link>
        <span className="cms-page-footer-sep"> · </span>
        <Link to={`/${langPrefix}`} className="cms-page-back">
          {t('blog.backHome')}
        </Link>
      </footer>
    </article>
  )
}
