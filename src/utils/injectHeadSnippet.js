/**
 * Skip if the same external script or GA config is already in head (e.g. baked in at build time).
 * @param {Element} node
 */
function headAlreadyHasEquivalentScript(node) {
  if (node.nodeType !== Node.ELEMENT_NODE || node.tagName.toLowerCase() !== 'script') return false
  const src = node.getAttribute('src')
  if (src) {
    try {
      const resolved = new URL(src, document.baseURI).href
      return [...document.querySelectorAll('head script[src]')].some((el) => {
        try {
          return new URL(el.getAttribute('src') || '', document.baseURI).href === resolved
        } catch {
          return false
        }
      })
    } catch {
      return false
    }
  }
  const text = node.textContent || ''
  const m = text.match(/gtag\s*\(\s*['"]config['"]\s*,\s*['"](G-[A-Z0-9]+)['"]/i)
  if (m) {
    const id = m[1]
    return [...document.querySelectorAll('head script:not([src])')].some((el) =>
      (el.textContent || '').includes(id),
    )
  }
  return false
}

/**
 * Injects CMS-provided HTML into document.head (meta tags, external scripts, inline gtag, etc.).
 * Scripts are recreated so they execute (innerHTML alone does not run scripts).
 * @param {string} html
 * @returns {Element[]} Appended nodes — remove these on cleanup.
 */
export function injectHeadSnippet(html) {
  const trimmed = String(html ?? '').trim()
  if (!trimmed || typeof document === 'undefined') return []

  const tpl = document.createElement('template')
  tpl.innerHTML = trimmed

  const injected = []
  tpl.content.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const tag = node.tagName.toLowerCase()

    if (tag === 'script') {
      if (headAlreadyHasEquivalentScript(node)) return
      const s = document.createElement('script')
      Array.from(node.attributes).forEach((attr) => {
        s.setAttribute(attr.name, attr.value)
      })
      if (node.textContent) s.textContent = node.textContent
      s.setAttribute('data-cms-runtime', 'snippet')
      document.head.appendChild(s)
      injected.push(s)
      return
    }

    const clone = node.cloneNode(true)
    if (clone.hasAttribute && !clone.hasAttribute('data-cms-runtime')) {
      clone.setAttribute('data-cms-runtime', 'snippet')
    }
    document.head.appendChild(clone)
    injected.push(clone)
  })

  return injected
}
