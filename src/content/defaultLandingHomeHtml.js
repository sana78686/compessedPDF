/**
 * Fallback home rich text when CMS content is empty. Simple English + SEO-friendly.
 * Site name from VITE_PUBLIC_SITE_NAME (falls back to "Compress PDF").
 */
export function getDefaultLandingHomeHtml() {
  const name = String(import.meta.env.VITE_PUBLIC_SITE_NAME || 'Compress PDF').trim() || 'Compress PDF'

  return `
<section class="default-landing-seo">
  <h2>What is ${name}?</h2>
  <p><strong>${name}</strong> is a free online tool to make your PDF files smaller. You upload a PDF, choose simple settings, and download a lighter file. No sign-up is required to try it.</p>

  <h2>What can you do here?</h2>
  <ul>
    <li><strong>Compress PDF</strong> — reduce file size so your PDF is easier to email or upload.</li>
    <li><strong>Merge &amp; split</strong> — combine pages or split one file into parts (where available).</li>
    <li><strong>Convert</strong> — turn other files to or from PDF (where available).</li>
  </ul>

  <h2>Who is it for?</h2>
  <p>Students, small businesses, and anyone who needs smaller PDFs without installing software. If you work on <strong>SEO</strong> or content, smaller PDFs can help pages load faster and improve user experience.</p>

  <h2>Is it safe?</h2>
  <p>Your file is processed for compression. Use the tool for files you are allowed to share. For sensitive documents, follow your company rules.</p>

  <h2>How to get started</h2>
  <p>Scroll up, select your PDF, then follow the steps on the screen. If you need help, use the <strong>Contact</strong> page.</p>
</section>
`.trim()
}
