import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { langPrefix, langToOgLocale } from '../i18n/translations'
import { useLang } from '../hooks/useLang'
import { useEffect } from 'react'
import { SeoHead } from '../components/SeoHead'
import './HomePage.css'
import './ComingSoonPage.css'

function ComingSoonPage() {
  const lang = useLang()
  const t = useTranslation(lang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <div className="coming-soon-page home-page">
      <SeoHead
        title="Coming Soon"
        description="This tool is under development. Try our Compress PDF tool in the meantime."
        robots="noindex,follow"
        ogTitle="Coming Soon"
        ogLocale={langToOgLocale(lang)}
      />
      <main className="coming-soon-main">
        <h1 className="coming-soon-title">Coming soon</h1>
        <p className="coming-soon-text">This tool is under development. Try our Compress PDF tool in the meantime.</p>
        <Link to={`${langPrefix(lang)}/tools`} className="coming-soon-btn">All PDF Tools</Link>
      </main>
    </div>
  )
}

export default ComingSoonPage
