import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { getBlogs } from '../api/cms'
import { SeoHead } from '../components/SeoHead'
import { getPreferredLang, supportedLangs, langToOgLocale, langPrefix } from '../i18n/translations'
import { useLang } from '../hooks/useLang'
import { resolveCmsMediaUrl } from '../utils/cmsAssetUrl'
import './BlogListPage.css'

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' })
  } catch {
    return iso
  }
}

function BlogCardCover({ src, title }) {
  const [broken, setBroken] = useState(false)
  const url = src ? resolveCmsMediaUrl(src) : ''
  if (!url || broken) {
    return <div className="blog-card-image-placeholder" aria-hidden="true" />
  }
  return (
    <img
      src={url}
      alt={title ? `Cover image for ${title}` : 'Blog post'}
      className="blog-card-image"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  )
}

export default function BlogListPage() {
  const lang = useLang()
  const t = useTranslation(lang)
  const localeForApi = supportedLangs.includes(lang) ? lang : getPreferredLang()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  useEffect(() => {
    getBlogs(localeForApi)
      .then((res) => setBlogs(res.blogs || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [localeForApi])

  if (loading) {
    return (
      <div className="blog-list-page wrap">
        <SeoHead title={t('blog.listTitle')} robots="noindex" />
        <p className="blog-list-loading">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blog-list-page wrap">
        <SeoHead
          title={t('blog.listTitle')}
          description={t('blog.listIntro')}
          robots="index,follow"
          ogTitle={t('blog.listTitle')}
          ogDescription={t('blog.listIntro')}
          ogLocale={langToOgLocale(lang)}
        />
        <p className="blog-list-error">{error}</p>
        <Link to={`${langPrefix(lang)}/`} className="blog-list-back">← {t('blog.backHome')}</Link>
      </div>
    )
  }

  return (
    <article className="blog-list-page wrap">
      <SeoHead
        title={t('blog.listTitle')}
        description={t('blog.listIntro')}
        robots="index,follow"
        ogTitle={t('blog.listTitle')}
        ogDescription={t('blog.listIntro')}
        ogLocale={langToOgLocale(lang)}
      />
      <header className="blog-list-header">
        <h1 className="blog-list-title">{t('blog.listTitle')}</h1>
        <p className="blog-list-intro">{t('blog.listIntro')}</p>
      </header>
      {blogs.length === 0 ? (
        <div className="blog-list-empty-state" role="status" aria-live="polite">
          <h2 className="blog-list-empty-title">{t('blog.emptyTitle')}</h2>
          <p className="blog-list-empty-text">{t('blog.emptyBody')}</p>
        </div>
      ) : (
        <div className="blog-list-grid">
          {blogs.map((post) => (
            <Link
              key={post.id}
              to={`${langPrefix(lang)}/blog/${post.slug}`}
              className="blog-card"
            >
              <div className="blog-card-image-wrap">
                <BlogCardCover src={post.og_image || post.image} title={post.title} />
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
        <Link to={`${langPrefix(lang)}/`} className="blog-list-back">← {t('blog.backHome')}</Link>
      </footer>
    </article>
  )
}
