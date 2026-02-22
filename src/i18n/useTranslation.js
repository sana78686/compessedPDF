import { useMemo } from 'react'
import { getTranslation } from './translations'

/**
 * Hook to get t(key) for the current language.
 * @param {string} lang - Language code (e.g. 'en', 'id', 'de')
 * @returns {(key: string) => string} t function, e.g. t('title') or t('nav.compress')
 */
export function useTranslation(lang) {
  return useMemo(() => {
    return (key) => getTranslation(lang, key)
  }, [lang])
}
