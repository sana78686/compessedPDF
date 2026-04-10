import { useParams } from 'react-router-dom'
import { defaultLang, supportedLangs } from '../i18n/translations'

/** Returns the effective language: URL param if valid, else defaultLang. */
export function useLang() {
  const { lang } = useParams()
  return lang && supportedLangs.includes(lang) ? lang : defaultLang
}
