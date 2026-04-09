import idTranslations from './translations.id.js'

/**
 * UI strings: id (Indonesian), en, ms (Malay), es, fr, ar, ru.
 * Missing keys fall back to English (see getTranslation).
 */
export const translations = {
  en: {
    logoMark: 'Compress PDF',
    nav: {
      merge: 'MERGE PDF',
      split: 'SPLIT PDF',
      compress: 'COMPRESS PDF',
      convert: 'CONVERT PDF',
      allTools: 'ALL PDF TOOLS',
      login: 'Login',
      dashboard: 'Dashboard',
      signUp: 'Sign up',
      home: 'Home',
    },
    title: 'Compress PDF files',
    subtitle: 'Reduce file size while optimizing for maximal PDF quality.',
    selectPdf: 'Select PDF files',
    orDrop: 'or drop PDFs here',
    fromCloud: 'From cloud',
    otherSources: 'Other sources',
    fileProtection: '✓ File protection is active',
    addMoreFiles: 'Add more files',
    removeFile: 'Remove',
    dpi: 'DPI',
    imageQuality: 'Image quality',
    color: 'Color',
    colorNoChange: 'No change',
    colorGray: 'Gray',
    compress: 'Compress',
    compressing: 'Compressing…',
    resultReduced: 'The size has been reduced by',
    shareOrContinue: 'Share or continue',
    download: 'Download',
    preview: 'Preview',
    erase: 'Erase',
    restart: 'Restart',
    googleDrive: 'Google Drive',
    dropbox: 'Dropbox',
    email: 'Email',
    mailSubject: 'Compressed PDF',
    mailBody: 'Download:',
    footer: '© 2026 – Powered by ApimsTec',
    footerProduct: 'PRODUCT',
    footerResources: 'RESOURCES',
    footerLegal: 'LEGAL',
    footerCompany: 'COMPANY',
    footerHome: 'Home',
    footerFeatures: 'Features',
    footerPricing: 'Pricing',
    footerFaq: 'FAQ',
    footerTools: 'Tools',
    footerSolutions: 'SOLUTIONS',
    footerBusiness: 'Business',
    footerEducation: 'Education',
    footerSecurity: 'Security',
    footerPress: 'Press',
    footerPrivacy: 'Privacy policy',
    footerTerms: 'Terms & conditions',
    footerDisclaimer: 'Disclaimer',
    footerCookies: 'Cookies',
    footerAbout: 'About us',
    footerContact: 'Contact us',
    footerBlog: 'Blog',
    footerOther: 'OTHER',
    footerCopyrightPrefix: '© compressedPDF 2026 ® – ',
    footerPoweredBy: 'powered by Apimstec',
    footerLanguage: 'English',
    footerGetGooglePlay: 'GET IT ON Google Play',
    footerDownloadAppStore: 'Download on the App Store',
    footerDownloadMacStore: 'Download on the Mac App Store',
    footerMicrosoftStore: 'Microsoft Store',
    ariaSelectPdf: 'Select PDF files',
    ariaColorMode: 'Color mode',
    ariaRemove: 'Remove',
    compressionSettings: 'Compression settings',
    compressionResult: 'Compression result',
    progressInitializing: 'Initializing…',
    progressLoading: 'Loading PDF…',
    progressPage: 'Compressing page',
    progressFinalizing: 'Finalizing…',
    progressGrayscale: 'Applying grayscale…',
    maxFilesReached: 'You already have the maximum of 10 PDFs. Remove one to add another.',
    maxFilesPartial: 'Only the first files that fit were added (maximum 10 PDFs).',
    maxFilesHint: 'Maximum 10 PDFs per session.',
    fileCountHint: '{count} of {max} PDFs selected',
    settingsRequiredHint: 'Enter DPI (72–300) and image quality (1–100%) to enable Compress.',
    fileDone: 'Done',
    compressFileProgress: 'File {current} of {total}: {name}',
    resultMultiTitle: 'Your compressed PDFs are ready',
    resultSavedSuffix: 'smaller',
    fromTheBlog: 'From the blog',
    viewAllPosts: 'View all posts',
    downloadAll: 'Download all',
    otherTools: 'Other tools',
    landing: {
      heroTitle: 'Compress PDF files online',
      heroSubtitle: 'Reduce file size while keeping great quality. Free, fast, and your files stay private.',
      ctaCompress: 'Compress PDF now',
      featuresTitle: 'Why use our PDF compressor?',
      feature1Title: 'Fast compression',
      feature1Desc: 'Reduce PDF size in seconds with optimized settings.',
      feature2Title: 'Quality control',
      feature2Desc: 'Choose DPI and image quality to balance size and clarity.',
      feature3Title: 'Privacy first',
      feature3Desc: 'Files are processed in your browser — we don’t store them.',
      feature4Title: 'Free to use',
      feature4Desc: 'No sign-up required. Compress as many PDFs as you need.',
      howTitle: 'How it works',
      howStep1: 'Upload',
      howStep1Desc: 'Select one or more PDF files from your device.',
      howStep2: 'Adjust',
      howStep2Desc: 'Set DPI and quality, then click Compress.',
      howStep3: 'Download',
      howStep3Desc: 'Get your smaller PDF and share or save it.',
      faqTitle: 'Frequently asked questions',
      faq1Q: 'Is it free?',
      faq1A: 'Yes. You can compress PDFs for free with no account required.',
      faq2Q: 'Are my files secure?',
      faq2A: 'Processing happens in your browser. Files are not uploaded to our servers.',
      faq3Q: 'What’s the maximum file size?',
      faq3A: 'There’s no hard limit. Very large files may take longer to process.',
      faq4Q: 'Will quality be reduced?',
      faq4A: 'You control DPI and image quality. Lower values mean smaller files and slightly lower visual quality.',
      readyTitle: 'Ready to compress?',
      readySubtitle: 'Select your PDF or drag and drop it below.',
      cmsSectionAria: 'Site introduction',
    },
    tools: {
      pageTitle: 'All PDF Tools',
      frequentlyUsed: 'Frequently used',
      mergePdf: 'Merge PDF',
      splitPdf: 'Split PDF',
      compressPdf: 'Compress PDF',
      editPdf: 'Edit PDF',
      signPdf: 'Sign PDF',
      convertPdf: 'PDF Converter',
      imagesToPdf: 'Images to PDF',
      pdfToImages: 'PDF to Images',
      extractImages: 'Extract PDF images',
      protectPdf: 'Protect PDF',
      unlockPdf: 'Unlock PDF',
      rotatePdf: 'Rotate PDF pages',
      removePages: 'Remove PDF pages',
      extractPages: 'Extract PDF pages',
      rearrangePages: 'Rearrange PDF pages',
      webpageToPdf: 'Webpage to PDF',
      pdfOcr: 'PDF OCR',
      addWatermark: 'Add watermark',
      addPageNumbers: 'Add page numbers',
      pdfOverlay: 'PDF Overlay',
      comparePdfs: 'Compare PDFs',
      webOptimize: 'Web optimize PDF',
      redactPdf: 'Redact PDF',
      createPdf: 'Create PDF',
      translatePdf: 'Translate PDF',
      jpgToPdf: 'JPG to PDF',
      wordToPdf: 'WORD to PDF',
      powerpointToPdf: 'POWERPOINT to PDF',
      excelToPdf: 'EXCEL to PDF',
      htmlToPdf: 'HTML to PDF',
      pdfToJpg: 'PDF to JPG',
      pdfToWord: 'PDF to WORD',
      pdfToPowerpoint: 'PDF to POWERPOINT',
      pdfToExcel: 'PDF to EXCEL',
      pdfToPdfa: 'PDF to PDF/A',
    },
    megaMenu: {
      organizePdf: 'ORGANIZE PDF',
      optimizePdf: 'OPTIMIZE PDF',
      convertToPdf: 'CONVERT TO PDF',
      convertFromPdf: 'CONVERT FROM PDF',
      editPdf: 'EDIT PDF',
      pdfSecurity: 'PDF SECURITY',
      pdfIntelligence: 'PDF INTELLIGENCE',
    },
    contact: {
      title: 'Contact',
      description: 'Get in touch – contact form and details.',
      intro: 'Contact us to report a problem, clarify any doubts about compressedPDF, or just find out more.',
      detailsHeading: 'Contact details',
      sendAnother: 'Send another message',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      backHome: 'Back to home',
      noDetails: 'Contact details are not set yet. They can be added in the content manager.',
      yourName: 'Your Name',
      yourEmail: 'Your Email',
      subject: 'Subject',
      chooseSubject: 'Choose a subject…',
      message: 'Message',
      writeMessage: 'Write a message',
      iAccept: 'I accept',
      termsAndConditions: 'Terms & Conditions',
      legalPrivacy: 'Legal & Privacy',
      sendMessage: 'Send message',
      successMessage: 'Your message has been sent. We will get back to you soon.',
      errorSend: 'Unable to send message. Please try again.',
      errorTerms: 'You must accept the Terms & Conditions and Legal & Privacy to send the form.',
      subjectGeneral: 'General inquiry',
      subjectSupport: 'Support',
      subjectFeedback: 'Feedback',
      subjectOther: 'Other',
    },
    blog: {
      listTitle: 'Blog',
      listIntro: 'Latest articles and updates.',
      readMore: 'Read more',
      noPosts: 'No blog posts yet.',
      emptyTitle: 'No articles yet',
      emptyBody:
        'We have not published any blog posts on this site yet. Please come back later for simple guides about PDF compression, our tools, and tips that are easy to read. You can still use the home page to compress your PDFs anytime.',
      backHome: 'Back to home',
      backToBlog: 'Back to blog',
    },
  },
  id: idTranslations,
  ms: {
    logoMark: 'Compress PDF',
    nav: {
      merge: 'GABUNG PDF',
      split: 'PECAH PDF',
      compress: 'COMPRESS PDF',
      convert: 'TUKAR PDF',
      allTools: 'SEMUA ALAT PDF',
      login: 'Log masuk',
      dashboard: 'Papan pemuka',
      signUp: 'Daftar',
      home: 'Laman utama',
    },
    title: 'Compress PDF files',
    subtitle: 'Kurangkan saiz fail dengan kualiti PDF yang baik.',
    selectPdf: 'Pilih fail PDF',
    orDrop: 'atau lepas PDF di sini',
    landing: {
      readySubtitle: 'Pilih PDF anda atau seret dan lepas di bawah.',
      cmsSectionAria: 'Site introduction',
      howTitle: 'Cara ia berfungsi',
      howStep1: 'Muat naik',
      howStep1Desc: 'Pilih satu atau lebih fail PDF daripada peranti anda.',
      howStep2: 'Laraskan',
      howStep2Desc: 'Tetapkan DPI dan kualiti, kemudian klik Mampatkan.',
      howStep3: 'Muat turun',
      howStep3Desc: 'Dapatkan PDF yang lebih kecil dan simpan atau kongsi.',
      faqTitle: 'Soalan lazim',
      featuresTitle: 'Mengapa alat kami?',
    },
    footerCopyrightPrefix: '© compressedPDF 2026 ® – ',
    footerPoweredBy: 'dikuasakan oleh Apimstec',
    footerLanguage: 'Bahasa Melayu',
    blog: {
      listTitle: 'Blog',
      listIntro: 'Artikel dan kemas kini terkini.',
      emptyTitle: 'Tiada artikel lagi',
      emptyBody:
        'Kami belum menerbitkan sebarang siaran blog untuk bahasa ini. Sila kembali kemudian, atau gunakan laman utama untuk mampatkan PDF anda.',
    },
  },
  es: {
    logoMark: 'Compress PDF',
    nav: {
      merge: 'UNIR PDF',
      split: 'DIVIDIR PDF',
      compress: 'COMPRESS PDF',
      convert: 'CONVERTIR PDF',
      allTools: 'TODAS LAS HERRAMIENTAS PDF',
      login: 'Iniciar sesión',
      dashboard: 'Panel',
      signUp: 'Registrarse',
      home: 'Inicio',
    },
    title: 'Compress PDF files',
    subtitle: 'Reduce el tamaño del archivo optimizando la calidad del PDF.',
    selectPdf: 'Seleccionar archivos PDF',
    orDrop: 'o suelta los PDF aquí',
    landing: {
      readySubtitle: 'Selecciona tu PDF o arrástralo y suéltalo abajo.',
      cmsSectionAria: 'Site introduction',
      howTitle: 'Cómo funciona',
      howStep1: 'Subir',
      howStep1Desc: 'Selecciona uno o más archivos PDF desde tu dispositivo.',
      howStep2: 'Ajustar',
      howStep2Desc: 'Configura DPI y calidad, luego pulsa Comprimir.',
      howStep3: 'Descargar',
      howStep3Desc: 'Obtén tu PDF más pequeño y guárdalo o compártelo.',
      faqTitle: 'Preguntas frecuentes',
      featuresTitle: '¿Por qué usar nuestro compresor?',
    },
    footerCopyrightPrefix: '© compressedPDF 2026 ® – ',
    footerPoweredBy: 'impulsado por Apimstec',
    footerLanguage: 'Español',
    blog: {
      listTitle: 'Blog',
      listIntro: 'Últimos artículos y novedades.',
      emptyTitle: 'Aún no hay artículos',
      emptyBody:
        'Todavía no hay entradas de blog en este idioma. Vuelve más tarde o usa la página principal para comprimir tus PDF.',
    },
  },
  fr: {
    logoMark: 'Compress PDF',
    nav: {
      merge: 'FUSIONNER PDF',
      split: 'DIVISER PDF',
      compress: 'COMPRESS PDF',
      convert: 'CONVERTIR PDF',
      allTools: 'TOUT LES OUTILS PDF',
      login: 'Connexion',
      dashboard: 'Tableau de bord',
      signUp: 'S’inscrire',
      home: 'Accueil',
    },
    title: 'Compress PDF files',
    subtitle: 'Réduisez la taille du fichier tout en optimisant la qualité PDF.',
    selectPdf: 'Sélectionner des fichiers PDF',
    orDrop: 'ou déposez les PDF ici',
    landing: {
      readySubtitle: 'Sélectionnez votre PDF ou glissez-déposez-le ci-dessous.',
      cmsSectionAria: 'Site introduction',
      howTitle: 'Comment ça marche',
      howStep1: 'Téléverser',
      howStep1Desc: 'Choisissez un ou plusieurs fichiers PDF sur votre appareil.',
      howStep2: 'Ajuster',
      howStep2Desc: 'Réglez le DPI et la qualité, puis cliquez sur Compresser.',
      howStep3: 'Télécharger',
      howStep3Desc: 'Obtenez un PDF plus léger et enregistrez-le ou partagez-le.',
      faqTitle: 'Questions fréquentes',
      featuresTitle: 'Pourquoi notre compresseur ?',
    },
    footerCopyrightPrefix: '© compressedPDF 2026 ® – ',
    footerPoweredBy: 'propulsé par Apimstec',
    footerLanguage: 'Français',
    blog: {
      listTitle: 'Blog',
      listIntro: 'Derniers articles et mises à jour.',
      emptyTitle: 'Pas encore d’articles',
      emptyBody:
        'Aucun article de blog n’est publié pour cette langue pour le moment. Revenez plus tard ou utilisez l’accueil pour compresser vos PDF.',
    },
  },
  ar: {
    logoMark: 'Compress PDF',
    nav: {
      merge: 'دمج PDF',
      split: 'تقسيم PDF',
      compress: 'COMPRESS PDF',
      convert: 'تحويل PDF',
      allTools: 'كل أدوات PDF',
      login: 'تسجيل الدخول',
      dashboard: 'لوحة التحكم',
      signUp: 'إنشاء حساب',
      home: 'الرئيسية',
    },
    title: 'Compress PDF files',
    subtitle: 'قلل حجم الملف مع الحفاظ على جودة PDF.',
    selectPdf: 'اختر ملفات PDF',
    orDrop: 'أو أسقط ملفات PDF هنا',
    landing: {
      readySubtitle: 'اختر ملف PDF أو اسحبه وأفلته أدناه.',
      cmsSectionAria: 'Site introduction',
      howTitle: 'كيف يعمل',
      howStep1: 'رفع',
      howStep1Desc: 'اختر ملف PDF واحدًا أو أكثر من جهازك.',
      howStep2: 'ضبط',
      howStep2Desc: 'اضبط الدقة والجودة، ثم اضغط ضغط.',
      howStep3: 'تنزيل',
      howStep3Desc: 'احصل على PDF أصغر واحفظه أو شاركه.',
      faqTitle: 'الأسئلة الشائعة',
      featuresTitle: 'لماذا أداتنا؟',
    },
    footerCopyrightPrefix: '© compressedPDF 2026 ® – ',
    footerPoweredBy: 'مدعوم من Apimstec',
    footerLanguage: 'العربية',
    blog: {
      listTitle: 'المدونة',
      listIntro: 'أحدث المقالات والتحديثات.',
      emptyTitle: 'لا مقالات بعد',
      emptyBody:
        'لا توجد مقالات بالعربية بعد. عد لاحقًا أو استخدم الصفحة الرئيسية لضغط ملفات PDF.',
    },
  },
  ru: {
    logoMark: 'Compress PDF',
    nav: {
      merge: 'ОБЪЕДИНИТЬ PDF',
      split: 'РАЗДЕЛИТЬ PDF',
      compress: 'COMPRESS PDF',
      convert: 'КОНВЕРТИРОВАТЬ PDF',
      allTools: 'ВСЕ ИНСТРУМЕНТЫ PDF',
      login: 'Войти',
      dashboard: 'Панель',
      signUp: 'Регистрация',
      home: 'Главная',
    },
    title: 'Compress PDF files',
    subtitle: 'Уменьшите размер файла, сохраняя качество PDF.',
    selectPdf: 'Выберите файлы PDF',
    orDrop: 'или перетащите PDF сюда',
    landing: {
      readySubtitle: 'Выберите PDF или перетащите его ниже.',
      cmsSectionAria: 'Site introduction',
      howTitle: 'Как это работает',
      howStep1: 'Загрузка',
      howStep1Desc: 'Выберите один или несколько PDF с устройства.',
      howStep2: 'Настройка',
      howStep2Desc: 'Задайте DPI и качество, затем нажмите Сжать.',
      howStep3: 'Скачать',
      howStep3Desc: 'Получите меньший PDF и сохраните или поделитесь.',
      faqTitle: 'Частые вопросы',
      featuresTitle: 'Почему наш компрессор?',
    },
    footerCopyrightPrefix: '© compressedPDF 2026 ® – ',
    footerPoweredBy: 'поддерживается Apimstec',
    footerLanguage: 'Русский',
    blog: {
      listTitle: 'Блог',
      listIntro: 'Последние статьи и обновления.',
      emptyTitle: 'Пока нет статей',
      emptyBody:
        'Для этого языка записей в блоге пока нет. Загляните позже или сожмите PDF на главной странице.',
    },
  },
}

/** Public site default until the visitor picks another language (stored in localStorage). */
export const defaultLang = 'id'

export const supportedLangs = ['id', 'en', 'ms', 'es', 'fr', 'ar', 'ru']

const OG_LOCALE_MAP = {
  id: 'id_ID',
  en: 'en_US',
  ms: 'ms_MY',
  es: 'es_ES',
  fr: 'fr_FR',
  ar: 'ar_SA',
  ru: 'ru_RU',
}

export function langToOgLocale(lang) {
  return OG_LOCALE_MAP[lang] || lang || ''
}

/** Strings always resolve from English if missing in the active locale (avoids recursion when defaultLang is id). */
const TRANSLATION_FALLBACK = 'en'

/** User-chosen UI language (persists across visits; survives refresh). */
const LOCALE_STORAGE_KEY = 'compresspdf_user_locale'

/** Legacy session hint from old geo detection — migrated once into localStorage. */
const LOCALE_HINT_KEY = 'compresspdf_locale_hint'
const LOCALE_HINT_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function readUserLocalePreference() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (!raw) return null
    const lang = String(raw).trim().toLowerCase()
    return supportedLangs.includes(lang) ? lang : null
  } catch {
    return null
  }
}

export function writeUserLocalePreference(lang) {
  if (typeof localStorage === 'undefined') return
  if (!supportedLangs.includes(lang)) return
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lang)
  } catch {
    /* private mode / quota */
  }
}

export function readLocaleHintCache() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(LOCALE_HINT_KEY)
    if (!raw) return null
    const { lang, t } = JSON.parse(raw)
    if (typeof lang !== 'string' || typeof t !== 'number') return null
    if (Date.now() - t > LOCALE_HINT_TTL_MS) {
      sessionStorage.removeItem(LOCALE_HINT_KEY)
      return null
    }
    return supportedLangs.includes(lang) ? lang : null
  } catch {
    return null
  }
}

export function writeLocaleHintCache(lang) {
  if (typeof sessionStorage === 'undefined') return
  if (!supportedLangs.includes(lang)) return
  try {
    sessionStorage.setItem(LOCALE_HINT_KEY, JSON.stringify({ lang, t: Date.now() }))
  } catch {
    /* private mode */
  }
}

/** Language option for dropdown: flag emoji + label */
export const langOptions = {
  id: { flag: '🇮🇩', label: 'Bahasa Indonesia' },
  en: { flag: '🇬🇧', label: 'English' },
  ms: { flag: '🇲🇾', label: 'Bahasa Melayu' },
  es: { flag: '🇪🇸', label: 'Español' },
  fr: { flag: '🇫🇷', label: 'Français' },
  ar: { flag: '🇸🇦', label: 'العربية' },
  ru: { flag: '🇷🇺', label: 'Русский' },
}

/** Map full browser locale tags to app lang (ISO 639-1). */
const BROWSER_LANG_ALIASES = {
  'id-id': 'id',
  'ms-my': 'ms',
  'en-my': 'ms',
  my: 'ms',
}

/**
 * Browser language list only (no geo cache). Used inside async geo resolver.
 */
export function getPreferredLangFromBrowser() {
  if (typeof navigator === 'undefined') return defaultLang
  const locales = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language]
  for (const locale of locales) {
    const full = (locale || '').toLowerCase().replace(/_/g, '-')
    if (BROWSER_LANG_ALIASES[full]) return BROWSER_LANG_ALIASES[full]
    const code = full.split('-')[0]
    if (BROWSER_LANG_ALIASES[code]) return BROWSER_LANG_ALIASES[code]
    if (supportedLangs.includes(code)) return code
  }
  return defaultLang
}

/**
 * Preferred lang for redirects / invalid URL recovery:
 * 1) explicit user choice (localStorage)
 * 2) one-time migration from legacy session geo hint
 * 3) default Indonesian (no IP lookup — fast first paint)
 */
export function getPreferredLang() {
  if (typeof window === 'undefined') return defaultLang
  const stored = readUserLocalePreference()
  if (stored) return stored
  const legacy = readLocaleHintCache()
  if (legacy) {
    writeUserLocalePreference(legacy)
    try {
      sessionStorage.removeItem(LOCALE_HINT_KEY)
    } catch {
      /* ignore */
    }
    return legacy
  }
  return defaultLang
}

export function getTranslation(lang, keyPath) {
  const langData = translations[lang] ?? translations[TRANSLATION_FALLBACK]
  const keys = keyPath.split('.')
  let value = langData
  for (const k of keys) {
    value = value?.[k]
  }
  if (value !== undefined && value !== null) return value
  if (lang !== TRANSLATION_FALLBACK) return getTranslation(TRANSLATION_FALLBACK, keyPath)
  return keyPath
}
