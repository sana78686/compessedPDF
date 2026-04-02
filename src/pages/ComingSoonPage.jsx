import { useParams, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { defaultLang } from '../i18n/translations'
import { useEffect } from 'react'
import { SeoHead } from '../components/SeoHead'
import './HomePage.css'
import './ComingSoonPage.css'

function ComingSoonPage() {
  const { lang = defaultLang } = useParams()
  const t = useTranslation(lang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <div className="coming-soon-page home-page">
      <SeoHead title="Coming soon" description="This tool is under development. Try our Compress PDF tool in the meantime." />
      <main className="coming-soon-main">
        <h1 className="coming-soon-title">Coming soon</h1>
        <p className="coming-soon-text">This tool is under development. Try our Compress PDF tool in the meantime.</p>
        <Link to={`/${lang}/tools`} className="coming-soon-btn">All PDF Tools</Link>
      </main>
    </div>
  )
}

export default ComingSoonPage
