import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { getBlogs } from '../api/cms'
import { SeoHead } from '../components/SeoHead'
import { getPreferredLang, supportedLangs } from '../i18n/translations'
import './BlogListPage.css'

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' })
  } catch {
    return iso
  }
}

export default function BlogListPage() {
  const { lang } = useParams()
  const t = useTranslation(lang)
  const langPrefix = supportedLangs.includes(lang) ? lang : getPreferredLang()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    getBlogs()
      .then((res) => setBlogs(res.blogs || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="blog-list-page wrap">
        <p className="blog-list-loading">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blog-list-page wrap">
        <SeoHead title={t('blog.listTitle')} />
        <p className="blog-list-error">{error}</p>
        <Link to={`/${langPrefix}`} className="blog-list-back">← {t('blog.backHome')}</Link>
      </div>
    )
  }

  return (
    <article className="blog-list-page wrap">
      <SeoHead title={t('blog.listTitle')} description={t('blog.listIntro')} />
      <header className="blog-list-header">
        <h1 className="blog-list-title">{t('blog.listTitle')}</h1>
        <p className="blog-list-intro">{t('blog.listIntro')}</p>
      </header>
      {blogs.length === 0 ? (
        <p className="blog-list-empty">{t('blog.noPosts')}</p>
      ) : (
        <div className="blog-list-grid">
          {blogs.map((post) => (
            <Link
              key={post.id}
              to={`/${langPrefix}/blog/${post.slug}`}
              className="blog-card"
            >
              <div className="blog-card-image-wrap">
                {(post.og_image || post.image) ? (
                  <img
                    src={post.og_image || post.image}
                    alt={post.title ? `Cover image for ${post.title}` : 'Blog post'}
                    className="blog-card-image"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="blog-card-image-placeholder" aria-hidden="true" />
                )}
              </div>
              <div className="blog-card-body">
                {post.published_at && (
                  <time className="blog-card-date" dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                )}
                <h2 className="blog-card-title">{post.title}</h2>
                {post.excerpt && (
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                )}
                <span className="blog-card-link">{t('blog.readMore')} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <footer className="blog-list-footer">
        <Link to={`/${langPrefix}`} className="blog-list-back">← {t('blog.backHome')}</Link>
      </footer>
    </article>
  )
}
