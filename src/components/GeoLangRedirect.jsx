import { Navigate } from 'react-router-dom'
import { defaultLang, getPreferredLang } from '../i18n/translations'

export default function GeoLangRedirect() {
  const lang = getPreferredLang()
  return <Navigate to={lang === defaultLang ? '/' : `/${lang}`} replace />
}
