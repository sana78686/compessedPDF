/**
 * Injects GA4 gtag.js for a Measurement ID (G-XXXXXXXXXX). Skips if that ID is already loaded.
 * @param {string} measurementId
 * @returns {HTMLScriptElement[]} Appended scripts — remove on cleanup.
 */
export function injectGa4(measurementId) {
  const id = String(measurementId ?? '').trim()
  if (!id || typeof document === 'undefined') return []
  if (!/^G-[A-Z0-9]+$/i.test(id)) return []

  const scripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')
  for (let i = 0; i < scripts.length; i += 1) {
    const src = scripts[i].getAttribute('src') || ''
    if (src.includes(encodeURIComponent(id)) || src.includes(`id=${id}`)) return []
  }

  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
  }

  const external = document.createElement('script')
  external.async = true
  external.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  external.setAttribute('data-cms-injected', 'ga4-loader')
  document.head.appendChild(external)

  const safeId = id.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const inline = document.createElement('script')
  inline.setAttribute('data-cms-injected', 'ga4-inline')
  inline.textContent =
    `window.dataLayer=window.dataLayer||[];` +
    `function gtag(){dataLayer.push(arguments);}` +
    `gtag('js',new Date());` +
    `gtag('config','${safeId}');`
  document.head.appendChild(inline)

  return [external, inline]
}

/**
 * @param {string} headSnippet
 * @param {string} measurementId
 */
export function headSnippetReferencesGaId(headSnippet, measurementId) {
  const s = String(headSnippet ?? '')
  const id = String(measurementId ?? '').trim()
  if (!s || !id) return false
  return s.includes(id)
}
