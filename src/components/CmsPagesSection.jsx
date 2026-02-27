import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPages, getBlogs } from '../api/cms'
import { supportedLangs } from '../i18n/translations'

export function CmsPagesSection() {
  const { lang } = useParams()
  const [pages, setPages] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loaded, setLoaded] = useState(false)

  const langPrefix = supportedLangs.includes(lang) ? lang : 'en'

  useEffect(() => {
    let cancelled = false
    Promise.all([getPages().catch(() => ({ pages: [] })), getBlogs().catch(() => ({ blogs: [] }))])
      .then(([pagesRes, blogsRes]) => {
        if (cancelled) return
        setPages(pagesRes.pages || [])
        setBlogs(blogsRes.blogs || [])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))

    return () => { cancelled = true }
  }, [])

  if (!loaded || (pages.length === 0 && blogs.length === 0)) return null

  return (
    <section className="cms-pages-section" aria-label="Pages from CMS">
      <div className="cms-pages-section-inner">
        {pages.length > 0 && (
          <div className="cms-pages-block">
            <h2 className="cms-pages-heading">Pages</h2>
            <ul className="cms-pages-list">
              {pages.map((p) => (
                <li key={p.id}>
                  <Link to={`/${langPrefix}/page/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {blogs.length > 0 && (
          <div className="cms-pages-block">
            <h2 className="cms-pages-heading">Blog</h2>
            <ul className="cms-pages-list">
              {blogs.map((b) => (
                <li key={b.id}>
                  <Link to={`/${langPrefix}/blog/${b.slug}`}>{b.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
