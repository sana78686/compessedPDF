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
      const s = document.createElement('script')
      Array.from(node.attributes).forEach((attr) => {
        s.setAttribute(attr.name, attr.value)
      })
      if (node.textContent) s.textContent = node.textContent
      document.head.appendChild(s)
      injected.push(s)
      return
    }

    const clone = node.cloneNode(true)
    document.head.appendChild(clone)
    injected.push(clone)
  })

  return injected
}
