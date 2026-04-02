import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { resolvePreferredLangAsync } from '../i18n/resolvePreferredLang'

/**
 * Resolves country (ipwho.is) → timezone → browser → default (Indonesia), caches in sessionStorage.
 */
export default function GeoLangRedirect() {
  const [lang, setLang] = useState(null)

  useEffect(() => {
    let cancelled = false
    resolvePreferredLangAsync().then((l) => {
      if (!cancelled) setLang(l)
    })
    return () => { cancelled = true }
  }, [])

  if (!lang) {
    return (
      <div className="route-fallback" style={{ minHeight: '120px' }} aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  return <Navigate to={`/${lang}`} replace />
}
