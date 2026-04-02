/**
 * Fallback home rich text when CMS has no body for this locale.
 * English = long SEO block; other locales = shorter intro (add full copy in CMS per language).
 */
function siteName() {
  return String(import.meta.env.VITE_PUBLIC_SITE_NAME || 'Compress PDF').trim() || 'Compress PDF'
}

const SHORT_BY_LANG = {
  id: (name) => `
<section class="default-landing-seo">
  <p class="default-landing-lead"><strong>${name}</strong> membantu Anda memperkecil file PDF di peramban. Tanpa instalasi: pilih file, tunggu sebentar, unduh PDF yang lebih ringan untuk dikirim lewat email atau diunggah ke formulir.</p>
  <h2>Apa itu “kompres PDF”?</h2>
  <p>Artinya mengurangi ukuran file sambil dokumen tetap nyaman dibaca atau dicetak. Cocok untuk faktur, tugas, dan hasil pindaian.</p>
  <p class="default-landing-note">Ganti teks ini dengan konten lengkap di CMS untuk bahasa Indonesia jika perlu.</p>
</section>`.trim(),
  ms: (name) => `
<section class="default-landing-seo">
  <p class="default-landing-lead"><strong>${name}</strong> membantu anda memampatkan fail PDF dalam pelayar. Tiada pemasangan diperlukan. Pilih fail, tunggu sebentar, dan muat turun PDF yang lebih kecil untuk dihantar melalui e-mel atau dimuat naik ke borang.</p>
  <h2>Apa itu “mampatkan PDF”?</h2>
  <p>Ia bermaksud mengurangkan saiz fail PDF dengan mengekalkan dokumen masih boleh dibaca. Sesuai untuk invois, kerja rumah, dan imbasan.</p>
  <p class="default-landing-note">Tambah teks penuh untuk bahasa ini dalam Pengurus Kandungan (CMS) jika anda mahu ganti bahagian ini.</p>
</section>`.trim(),
  es: (name) => `
<section class="default-landing-seo">
  <p class="default-landing-lead"><strong>${name}</strong> te ayuda a reducir el tamaño de tus PDF en el navegador. No hace falta instalar nada: elige el archivo, espera un momento y descarga un PDF más ligero para enviar por correo o subir a un formulario.</p>
  <h2>¿Qué es “comprimir PDF”?</h2>
  <p>Significa bajar el peso del archivo manteniendo el documento útil para leer o imprimir. Ideal para facturas, trabajos y escaneos.</p>
  <p class="default-landing-note">Puedes sustituir este texto con contenido completo en el CMS para este idioma.</p>
</section>`.trim(),
  fr: (name) => `
<section class="default-landing-seo">
  <p class="default-landing-lead"><strong>${name}</strong> vous aide à réduire la taille de vos PDF dans le navigateur. Aucune installation : choisissez le fichier, patientez, puis téléchargez un PDF plus léger à envoyer par e-mail ou à joindre en ligne.</p>
  <h2>Que signifie « compresser un PDF » ?</h2>
  <p>C’est diminuer la taille du fichier tout en gardant un document lisible. Utile pour factures, devoirs et scans.</p>
  <p class="default-landing-note">Remplacez ce bloc par un texte complet dans le CMS pour cette langue.</p>
</section>`.trim(),
  ar: (name) => `
<section class="default-landing-seo" dir="rtl">
  <p class="default-landing-lead"><strong>${name}</strong> يساعدك على تقليل حجم ملفات PDF في المتصفح دون تثبيت برامج. اختر الملف، انتظر قليلًا، ثم نزّل نسخة أصغر لإرسالها بالبريد أو رفعها في نموذج.</p>
  <h2>ماذا يعني «ضغط PDF»؟</h2>
  <p>يعني تقليل حجم الملف مع بقاء المستند قابلاً للقراءة. مفيد للفواتير والواجبات والمستندات الممسوحة.</p>
  <p class="default-landing-note">يمكنك استبدال هذا النص بنسخة كاملة من لوحة إدارة المحتوى لهذه اللغة.</p>
</section>`.trim(),
  ru: (name) => `
<section class="default-landing-seo">
  <p class="default-landing-lead"><strong>${name}</strong> помогает уменьшить размер PDF прямо в браузере. Установка не нужна: выберите файл, подождите и скачайте более лёгкий PDF для почты или загрузки в форму.</p>
  <h2>Что значит «сжать PDF»?</h2>
  <p>Это уменьшить размер файла, сохранив документ читаемым. Подходит для счетов, работ и сканов.</p>
  <p class="default-landing-note">Полный текст для этого языка можно задать в CMS.</p>
</section>`.trim(),
}

export function getDefaultLandingHomeHtml(lang = 'id') {
  const name = siteName()
  const builder = SHORT_BY_LANG[lang]
  if (builder) return builder(name)

  return `
<section class="default-landing-seo">
  <p class="default-landing-lead"><strong>${name}</strong> helps you make PDF files smaller on the web. You do not need to install a program on your computer. You pick your file, wait a short time, and download a new PDF that is easier to share by email or on a website.</p>

  <h2>What does “compress PDF” mean?</h2>
  <p>A PDF can hold text, pictures, and other parts. Sometimes the file is very big. <strong>Compress PDF</strong> means we try to lower the file size while keeping the document useful for reading and printing. Smaller files open faster and use less storage on your phone or laptop.</p>

  <h2>What you can do with ${name}</h2>
  <ul class="default-landing-list">
    <li><strong>Shrink a PDF</strong> — Good for homework, invoices, scans, and reports when the file is too large to send.</li>
    <li><strong>Work in the browser</strong> — Use our tools from home, school, or the office without admin rights to install software.</li>
    <li><strong>Save time</strong> — Fewer “file too big” errors when you upload to forms or cloud drives.</li>
  </ul>
  <p>We also offer other PDF tools (like merge, split, and convert) from the same site. Open <strong>All tools</strong> in the menu to see the full list.</p>

  <h2>Who should use this?</h2>
  <p>Anyone who works with PDFs: teachers, students, small shops, designers, and people who fill online forms. If you care about <strong>SEO</strong> (search engine optimization), fast pages and light files can help visitors stay on your site. ${name} is written in plain language so you can understand every step.</p>

  <h2>How to compress a PDF (simple steps)</h2>
  <ol class="default-landing-steps">
    <li>Go to the top of this page.</li>
    <li>Click the button to choose your PDF, or drag the file into the box.</li>
    <li>Pick quality settings if we show them — lower quality often means a smaller file.</li>
    <li>Start compression and download your new PDF when it is ready.</li>
  </ol>

  <h2>Safety and privacy (in simple words)</h2>
  <p>Only use files you are allowed to process. Do not upload secret company data if your rules say no. If you are not sure, ask your manager or IT team first. For general personal documents, many people use online tools every day — still, think before you upload anything private.</p>

  <h2>Need help?</h2>
  <p>If something does not work or you have a question, visit our <strong>Contact</strong> page (link in the footer). We read messages and try to answer when we can.</p>

  <p class="default-landing-note">This text is here so search engines and new visitors quickly understand what ${name} does. When your team adds custom text in the CMS, it can replace this section.</p>
</section>
`.trim()
}
