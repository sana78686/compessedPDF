import { useState, useCallback, useRef, useEffect, lazy, Suspense, startTransition, useMemo } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { defaultLang } from '../i18n/translations'
import { getFaq, getHomeCards, getBlogs, getHomePageContent, getToolSchemaJsonLd } from '../api/cms'
import JsonLd from '../components/JsonLd'
import './HomePage.css'
import './CmsPage.css'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { COMPRESS_PDF_EN } from '../constants/brand'

const LandingBelowFold = lazy(() => import('./LandingBelowFold'))
const LandingFaqSection = lazy(() => import('./LandingFaqSection'))

// Workaround for servers that serve .mjs as application/octet-stream: fetch worker as text
// and create a blob URL so the worker runs with correct MIME (works on live without Nginx fix).
let cachedWorkerBlobUrl = null
async function getPdfWorkerSrc() {
  if (cachedWorkerBlobUrl) return cachedWorkerBlobUrl
  try {
    const url = pdfWorkerUrl.startsWith('http') ? pdfWorkerUrl : `${window.location.origin}${pdfWorkerUrl}`
    const res = await fetch(url)
    const text = await res.text()
    const blob = new Blob([text], { type: 'application/javascript' })
    cachedWorkerBlobUrl = URL.createObjectURL(blob)
    return cachedWorkerBlobUrl
  } catch {
    return pdfWorkerUrl
  }
}

const STEP_UPLOAD = 1
const STEP_SETTINGS = 2
const STEP_RESULT = 3

const MAX_PDF_FILES = 10

function cmsHtmlHasVisibleText(html) {
  if (!html || typeof html !== 'string') return false
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > 0
}

/** DPI and image quality must both be set to valid positive numbers before compress is enabled. */
function parseCompressionSettings(settings) {
  const d = parseFloat(String(settings.dpi ?? '').trim())
  const q = parseFloat(String(settings.imageQuality ?? '').trim())
  const dpiOk = Number.isFinite(d) && d > 0 && d >= 72 && d <= 300
  const qOk = Number.isFinite(q) && q > 0 && q <= 100
  return {
    dpi: dpiOk ? d : 144,
    qualityUnit: qOk ? q : 75,
    qualityFrac: qOk ? q / 100 : 0.75,
    valid: dpiOk && qOk,
  }
}

function HomePage() {
  const { lang = defaultLang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const t = useTranslation(lang)
  const isResultPath = pathname === `/${lang}/compress/result`
  const isCompressPath = pathname === `/${lang}/compress`
  const isCompressPage = isCompressPath || isResultPath
  const step = isResultPath ? STEP_RESULT : isCompressPath ? STEP_SETTINGS : STEP_UPLOAD
  const isHomeLanding = pathname === `/${lang}` || pathname === `/${lang}/`

  const COLOR_OPTIONS = [
    { value: 'no-change', label: t('colorNoChange') },
    { value: 'gray', label: t('colorGray') },
  ]

  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [settings, setSettings] = useState({
    dpi: '144',
    imageQuality: '75',
    color: 'no-change',
  })
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState({ message: '', percent: 0 })
  const [progressVisible, setProgressVisible] = useState(false)
  const [compressFileRows, setCompressFileRows] = useState([])
  const [error, setError] = useState(null)
  /** @type {Array<{ blob: Blob, fileName: string, originalSize: number, newSize: number, percentageSaved: number }> | null} */
  const [compressionResults, setCompressionResults] = useState(null)
  const fileInputRef = useRef(null)
  const dragDepthRef = useRef(0)
  const [faqOpenIndex, setFaqOpenIndex] = useState(null)
  const [showBelowFold, setShowBelowFold] = useState(false)
  const [landingFaq, setLandingFaq] = useState([])
  const [landingCards, setLandingCards] = useState([])
  /** Blog links under landing + compress tool (replaces removed “Other tools”). */
  const [teaserBlogs, setTeaserBlogs] = useState([])
  /** CMS “Home page” rich text (locale-specific), from public /home-content */
  const [cmsHomeHtml, setCmsHomeHtml] = useState('')
  const [homeJsonLd, setHomeJsonLd] = useState(null)
  const [toolJsonLd, setToolJsonLd] = useState(null)

  const parsedSettings = useMemo(() => parseCompressionSettings(settings), [settings.dpi, settings.imageQuality])
  const canCompress = parsedSettings.valid && files.length > 0

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  /* Home landing: fetch CMS home HTML + blog teasers in parallel (one network wait). Compress page: blogs only. */
  useEffect(() => {
    if (!isHomeLanding && !isCompressPage) return undefined
    let cancelled = false
    const blogPromise = getBlogs(lang)
      .then((res) => {
        if (cancelled) return
        setTeaserBlogs(Array.isArray(res.blogs) ? res.blogs : [])
      })
      .catch(() => {
        if (!cancelled) setTeaserBlogs([])
      })
    if (!isHomeLanding) {
      return () => {
        cancelled = true
      }
    }
    const homePromise = getHomePageContent(lang)
      .then((res) => {
        if (cancelled) return
        setCmsHomeHtml(typeof res?.content === 'string' ? res.content : '')
        const graph = res?.json_ld?.['@graph']
        setHomeJsonLd(Array.isArray(graph) && graph.length > 0 ? res.json_ld : null)
      })
      .catch(() => {
        if (!cancelled) {
          setCmsHomeHtml('')
          setHomeJsonLd(null)
        }
      })
    void Promise.all([blogPromise, homePromise])
    return () => {
      cancelled = true
    }
  }, [isHomeLanding, isCompressPage, lang])

  useEffect(() => {
    if (!isCompressPage) {
      setToolJsonLd(null)
      return undefined
    }
    let cancelled = false
    getToolSchemaJsonLd(lang)
      .then((res) => {
        if (cancelled) return
        const graph = res?.json_ld?.['@graph']
        setToolJsonLd(Array.isArray(graph) && graph.length > 0 ? res.json_ld : null)
      })
      .catch(() => {
        if (!cancelled) setToolJsonLd(null)
      })
    return () => {
      cancelled = true
    }
  }, [isCompressPage, lang])

  /* Fetch FAQ and cards when below-the-fold is shown */
  useEffect(() => {
    if (!showBelowFold) return
    let cancelled = false
    Promise.all([
      getFaq(lang).catch(() => ({ faq: [] })),
      getHomeCards(lang).catch(() => ({ cards: [] })),
    ])
      .then(([faqRes, cardsRes]) => {
        if (cancelled) return
        setLandingFaq(Array.isArray(faqRes.faq) ? faqRes.faq : [])
        setLandingCards(Array.isArray(cardsRes.cards) ? cardsRes.cards : [])
      })
    return () => { cancelled = true }
  }, [showBelowFold, lang])

  /* Defer below-the-fold content to reduce TBT on mobile (Lighthouse Performance) */
  useEffect(() => {
    if (!isCompressPage) {
      const schedule = () => startTransition(() => setShowBelowFold(true))
      const id = typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(schedule, { timeout: 1500 })
        : setTimeout(schedule, 100)
      return () => (typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback(id) : clearTimeout(id))
    }
  }, [isCompressPage])

  // Sync URL with state: on /compress/result with no result data -> back to settings
  useEffect(() => {
    if (isResultPath && (!compressionResults || compressionResults.length === 0)) {
      navigate(`/${lang}/compress`, { replace: true })
    }
  }, [isResultPath, compressionResults, navigate, lang])

  // Sync URL with state: on /compress with no files -> go to upload
  useEffect(() => {
    if (isCompressPath && files.length === 0) {
      navigate(`/${lang}`, { replace: true })
    }
  }, [isCompressPath, files.length, navigate, lang])

  const handleFileSelect = useCallback((e) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type === 'application/pdf')
    if (selected.length) {
      setFiles((prev) => {
        const room = MAX_PDF_FILES - prev.length
        if (room <= 0) {
          setError(t('maxFilesReached'))
          return prev
        }
        const toAdd = selected.slice(0, room)
        if (selected.length > toAdd.length) setError(t('maxFilesPartial'))
        else setError(null)
        return [...prev, ...toAdd]
      })
      navigate(`/${lang}/compress`, { replace: true })
    }
    e.target.value = ''
  }, [navigate, lang, t])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = 0
    setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) => f.type === 'application/pdf')
    if (dropped.length) {
      setFiles((prev) => {
        const room = MAX_PDF_FILES - prev.length
        if (room <= 0) {
          setError(t('maxFilesReached'))
          return prev
        }
        const toAdd = dropped.slice(0, room)
        if (dropped.length > toAdd.length) setError(t('maxFilesPartial'))
        else setError(null)
        return [...prev, ...toAdd]
      })
      navigate(`/${lang}/compress`, { replace: true })
    }
  }, [navigate, lang, t])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current += 1
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current -= 1
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0
      setIsDragging(false)
    }
  }, [])

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    if (!next.length) {
      navigate(`/${lang}`, { replace: true })
    }
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  const addMoreFiles = () => fileInputRef.current?.click()

  // Load PDF via object URL so the worker fetches it — avoids transferring ArrayBuffer (detached buffer error)
  const loadPdfFromUrl = async (pdfjsLib, url) => {
    const pdf = await pdfjsLib.getDocument({ url }).promise
    return pdf
  }

  const applyGrayscaleToPdf = async (arrayBuffer, dpi, qualityFrac) => {
    const [pdfjsLib, { jsPDF }] = await Promise.all([
      import('pdfjs-dist'),
      import('jspdf'),
    ])
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = await getPdfWorkerSrc()
    }
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    try {
      const pdf = await loadPdfFromUrl(pdfjsLib, url)
      const numPages = pdf.numPages
      const doc = new jsPDF({ unit: 'px', compress: true })
      const scale = Math.min(2, dpi / 72)
      const quality = qualityFrac

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data
        for (let j = 0; j < data.length; j += 4) {
          const g = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2]
          data[j] = data[j + 1] = data[j + 2] = g
        }
        ctx.putImageData(imgData, 0, 0)
        const dataUrl = String(canvas.toDataURL('image/jpeg', quality))
        const w = Number(viewport.width)
        const h = Number(viewport.height)
        if (i > 1) {
          doc.addPage([w, h])
        } else {
          doc.addPage([w, h])
          doc.deletePage(1)
        }
        doc.addImage(dataUrl, 'JPEG', 0, 0, w, h, undefined, 'FAST')
      }
      return doc.output('arraybuffer')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const runCompress = async () => {
    if (!files.length || !parsedSettings.valid) return
    setError(null)
    setCompressionResults(null)
    setIsCompressing(true)
    setProgressVisible(false)
    setProgress({ message: t('progressInitializing'), percent: 0 })
    setCompressFileRows(files.map((f) => ({ name: f.name, status: 'waiting' })))

    const dpi = parsedSettings.dpi
    const quality = parsedSettings.qualityFrac
    const colorIsGray = settings.color === 'gray'
    const nFiles = files.length

    const showBarTimer = typeof window !== 'undefined'
      ? window.setTimeout(() => setProgressVisible(true), 220)
      : 0

    try {
      const [pdfjsLib, { jsPDF }] = await Promise.all([
        import('pdfjs-dist'),
        import('jspdf'),
      ])
      if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = await getPdfWorkerSrc()
      }

      const results = []

      for (let fi = 0; fi < nFiles; fi++) {
        const file = files[fi]
        const originalSize = file.size

        setCompressFileRows((rows) => rows.map((row, i) => ({
          ...row,
          status: i < fi ? 'done' : i === fi ? 'active' : 'waiting',
        })))
        setProgress({
          message: t('compressFileProgress', { current: fi + 1, total: nFiles, name: file.name }),
          percent: Math.round((fi / Math.max(nFiles, 1)) * 100),
        })

        let blobUrl = URL.createObjectURL(file)
        try {
          const pdf = await loadPdfFromUrl(pdfjsLib, blobUrl)
          const numPages = pdf.numPages
          const doc = new jsPDF({ unit: 'px', compress: true })
          const scale = Math.min(2.5, dpi / 72)

          for (let i = 1; i <= numPages; i++) {
            const base = fi / nFiles
            const frac = i / numPages / nFiles
            setProgress({
              message: `${t('progressPage')} ${i}/${numPages} — ${file.name}`,
              percent: Math.min(99, Math.round((base + frac) * 100)),
            })
            const page = await pdf.getPage(i)
            const viewport = page.getViewport({ scale: 1 })
            const viewportScaled = page.getViewport({ scale })
            const canvas = document.createElement('canvas')
            canvas.width = viewportScaled.width
            canvas.height = viewportScaled.height
            const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false })
            await page.render({
              canvasContext: ctx,
              viewport: viewportScaled,
            }).promise
            const dataUrl = String(canvas.toDataURL('image/jpeg', quality))
            const w = Number(viewport.width)
            const h = Number(viewport.height)
            if (i > 1) {
              doc.addPage([w, h])
            } else {
              doc.addPage([w, h])
              doc.deletePage(1)
            }
            doc.addImage(dataUrl, 'JPEG', 0, 0, w, h, undefined, 'FAST')
          }

          let outputBuffer = doc.output('arraybuffer')
          if (colorIsGray) {
            setProgress({ message: t('progressGrayscale'), percent: Math.min(99, Math.round(((fi + 0.9) / nFiles) * 100)) })
            outputBuffer = await applyGrayscaleToPdf(outputBuffer, dpi, quality)
          }

          const blob = new Blob([outputBuffer], { type: 'application/pdf' })
          const newSize = blob.size
          const percentageSaved = originalSize > 0 ? (1 - newSize / originalSize) * 100 : 0
          results.push({
            blob,
            fileName: String(file.name || 'document').replace(/\.pdf$/i, '') + '-compressed.pdf',
            originalSize,
            newSize,
            percentageSaved,
          })
        } finally {
          URL.revokeObjectURL(blobUrl)
        }

        setCompressFileRows((rows) => rows.map((row, i) => ({
          ...row,
          status: i <= fi ? 'done' : 'waiting',
        })))
      }

      setProgress({ message: t('progressFinalizing'), percent: 100 })
      setCompressionResults(results)
      navigate(`/${lang}/compress/result`, { replace: true })
    } catch (err) {
      const msg = err?.message != null ? String(err.message) : ''
      const cause = err?.underlyingError?.message ?? err?.cause?.message
      const causeStr = cause != null ? String(cause) : ''
      const message = causeStr
        ? `${msg || 'Compression failed'}: ${causeStr}`
        : (msg || 'Compression failed. Please try again.')
      setError(message)
    } finally {
      if (showBarTimer) clearTimeout(showBarTimer)
      setProgressVisible(false)
      setIsCompressing(false)
      setProgress({ message: '', percent: 0 })
      setCompressFileRows([])
    }
  }

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadOne = (blob, fileName) => {
    downloadBlob(blob, fileName)
  }

  const handleDownload = () => {
    if (!compressionResults?.length) return
    if (compressionResults.length === 1) {
      downloadBlob(compressionResults[0].blob, compressionResults[0].fileName)
      return
    }
    compressionResults.forEach((r) => downloadBlob(r.blob, r.fileName))
  }

  const handlePreview = () => {
    const first = compressionResults?.[0]
    if (!first?.blob) return
    const url = URL.createObjectURL(first.blob)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleErase = () => {
    setCompressionResults(null)
    navigate(`/${lang}/compress`, { replace: true })
  }

  const handleRestart = () => {
    setCompressionResults(null)
    setFiles([])
    setError(null)
    navigate(`/${lang}`, { replace: true })
  }

  /* CMS FAQ: show section only when at least one item exists */
  const faqItems = landingFaq.length > 0
    ? landingFaq.map((item) => ({ q: item.question, a: item.answer }))
    : []

  return (
    <div className="home-page">
      <JsonLd data={isCompressPage ? toolJsonLd : isHomeLanding ? homeJsonLd : null} />
      <main id="main-content" className={`main ${!isCompressPage ? 'main--landing' : ''}`} tabIndex="-1">
        {isCompressPage && (
          <>
            <h1 className="main-title">{t('title')}</h1>
            <p className="main-subtitle">{t('subtitle')}</p>
          </>
        )}
        <input
          ref={fileInputRef}
          id="pdf-file-input"
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileSelect}
          className="sr-only"
          aria-label={t('ariaSelectPdf')}
        />

        {!isCompressPage && (
          <>
            {/* SEO: Upload section first – main CTA above the fold */}
            <section id="compress-tool" className="landing-upload-section landing-upload-section--first" aria-labelledby="landing-upload-h1">
              <h1 id="landing-upload-h1" className="landing-upload-h1">{COMPRESS_PDF_EN}</h1>
              <p id="landing-select-heading" className="landing-upload-heading">{t('landing.readySubtitle')}</p>
              <div
                className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
              >
                <div className="upload-actions landing-upload-cta">
                  <button
                    type="button"
                    className="btn-select-pdf"
                    onClick={triggerFileInput}
                    aria-label={t('ariaSelectPdf')}
                  >
                    {t('selectPdf')}
                  </button>
                </div>
                <p
                  className="upload-hint"
                  role="button"
                  tabIndex={0}
                  onClick={triggerFileInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      triggerFileInput()
                    }
                  }}
                >
                  {t('orDrop')}
                </p>
              </div>
            </section>

            {cmsHtmlHasVisibleText(cmsHomeHtml) && (
              <section
                className="landing-cms-body-section"
                aria-label={t('landing.cmsSectionAria')}
              >
                <div
                  className="cms-home-cms-body cms-page-content"
                  dangerouslySetInnerHTML={{ __html: cmsHomeHtml }}
                />
              </section>
            )}

            {showBelowFold && (
              <Suspense fallback={null}>
                <LandingBelowFold t={t} cards={landingCards} />
              </Suspense>
            )}
          </>
        )}

        


        {/* Step 2: Settings + file list */}
        {isCompressPage && step === STEP_SETTINGS && (
          <section className="step-settings" aria-label={t('compressionSettings')}>
            <div
              className={`file-display-zone ${isDragging ? 'file-display-zone--dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <div className="file-display-header">
                <span className="file-badge">{t('fileProtection')}</span>
                <button
                  type="button"
                  className={`link-add-more ${files.length >= MAX_PDF_FILES ? 'link-add-more--disabled' : ''}`}
                  onClick={addMoreFiles}
                  disabled={files.length >= MAX_PDF_FILES}
                >
                  {t('addMoreFiles')}
                </button>
              </div>
              <p className="file-count-hint" role="status">
                {t('fileCountHint', { count: String(files.length), max: String(MAX_PDF_FILES) })}
              </p>
              <ul className="file-cards">
                {files.map((file, i) => (
                  <li key={`${file.name}-${file.lastModified}-${i}`} className="file-card">
                    <div className="file-card-preview">
                      <span className="file-card-icon">PDF</span>
                    </div>
                    <span className="file-card-name" title={file.name}>{file.name}</span>
                    <button
                      type="button"
                      className="file-card-remove"
                      onClick={() => removeFile(i)}
                      aria-label={`${t('ariaRemove')} ${file.name}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                        <line x1="10" y1="15" x2="14" y2="15" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="settings-row">
                <label className="setting-label">
                  <span>{t('dpi')}</span>
                  <input
                    type="number"
                    min="72"
                    max="300"
                    inputMode="numeric"
                    placeholder="72–300"
                    value={settings.dpi}
                    onChange={(e) => setSettings((s) => ({ ...s, dpi: e.target.value }))}
                    className="setting-input"
                    aria-invalid={!parsedSettings.valid}
                  />
                </label>
                <label className="setting-label">
                  <span>{t('imageQuality')}</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    inputMode="numeric"
                    placeholder="1–100"
                    value={settings.imageQuality}
                    onChange={(e) => setSettings((s) => ({ ...s, imageQuality: e.target.value }))}
                    className="setting-input"
                    aria-invalid={!parsedSettings.valid}
                  />
                  <span className="setting-suffix">%</span>
                </label>
                <label className="setting-label">
                  <span>{t('color')}</span>
                  <select
                    value={settings.color}
                    onChange={(e) => setSettings((s) => ({ ...s, color: e.target.value }))}
                    className="setting-select"
                    aria-label={t('ariaColorMode')}
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              {!parsedSettings.valid && (
                <p className="settings-hint" role="note">{t('settingsRequiredHint')}</p>
              )}
              <button
                type="button"
                className="btn-compress-large"
                onClick={runCompress}
                disabled={isCompressing || !canCompress}
              >
                {isCompressing ? t('compressing') : t('compress')}
              </button>
            </div>
            {isCompressing && (
              <div className="compress-progress-wrap" aria-live="polite">
                {progressVisible && (
                  <div className="compress-progress-bar-track" aria-hidden="true">
                    <div
                      className="compress-progress-bar-fill"
                      style={{ width: `${Math.max(0, Math.min(100, progress.percent))}%` }}
                    />
                  </div>
                )}
                {progress.message && (
                  <p className="progress-message" role="status">{progress.message}</p>
                )}
                {compressFileRows.length > 0 && (
                  <ul className="compress-file-progress-list">
                    {compressFileRows.map((row, idx) => (
                      <li
                        key={`${row.name}-${idx}`}
                        className={`compress-file-progress-item compress-file-progress-item--${row.status}`}
                      >
                        <span className="compress-file-progress-status" aria-hidden="true">
                          {row.status === 'done' ? '✓' : row.status === 'active' ? '…' : '○'}
                        </span>
                        <span className="compress-file-progress-name">{row.name}</span>
                        {row.status === 'done' && <span className="compress-file-progress-label">{t('fileDone')}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}

        {/* Step 3: Result + actions */}
        {isCompressPage && step === STEP_RESULT && compressionResults && compressionResults.length > 0 && (
          <section className="step-result" aria-label={t('compressionResult')}>
            <div className="result-banner">
              <span className="result-settings">
                {t('dpi')}: {settings.dpi || '—'}, {t('imageQuality')}: {settings.imageQuality ? `${settings.imageQuality}%` : '—'}, {t('color')}: {settings.color === 'gray' ? t('colorGray') : t('colorNoChange')}
              </span>
            </div>
            {compressionResults.length === 1 ? (
              <>
                <p className="result-title">
                  {t('resultReduced')} <strong>{compressionResults[0].percentageSaved?.toFixed(2) ?? 0}%</strong>.
                </p>
                <p className="result-filename">
                  {compressionResults[0].fileName} – {(compressionResults[0].blob.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <p className="result-title">{t('resultMultiTitle')}</p>
                <ul className="result-multi-list">
                  {compressionResults.map((r, idx) => (
                    <li key={`${r.fileName}-${idx}`} className="result-multi-row">
                      <div className="result-multi-info">
                        <span className="result-multi-name">{r.fileName}</span>
                        <span className="result-multi-meta">
                          {(r.blob.size / 1024).toFixed(2)} KB · {r.percentageSaved?.toFixed(1) ?? 0}% {t('resultSavedSuffix')}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-action btn-download btn-download--compact"
                        onClick={() => handleDownloadOne(r.blob, r.fileName)}
                      >
                        {t('download')}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="result-actions">
              {compressionResults.length > 1 && (
                <button type="button" className="btn-action btn-download" onClick={handleDownload}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  {t('downloadAll')}
                </button>
              )}
              {compressionResults.length === 1 && (
                <>
                  <button type="button" className="btn-action btn-download" onClick={handleDownload}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    {t('download')}
                  </button>
                  <button type="button" className="btn-action btn-preview" onClick={handlePreview}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {t('preview')}
                  </button>
                </>
              )}
              <button type="button" className="btn-action btn-erase" onClick={handleErase}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                </svg>
                {t('erase')}
              </button>
              <button type="button" className="btn-action btn-restart" onClick={handleRestart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                </svg>
                {t('restart')}
              </button>
            </div>
            {compressionResults.length === 1 && (
              <div className="result-share">
                <span className="result-share-label">{t('shareOrContinue')}</span>
                <div className="result-share-btns">
                  <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="share-btn" aria-label={t('googleDrive')}>
                    <span className="share-icon gdrive" aria-hidden="true">G</span>
                    <span>{t('googleDrive')}</span>
                  </a>
                  <a href="https://dropbox.com" target="_blank" rel="noopener noreferrer" className="share-btn" aria-label={t('dropbox')}>
                    <span className="share-icon dropbox" aria-hidden="true">D</span>
                    <span>{t('dropbox')}</span>
                  </a>
                  <a href="#" className="share-btn" aria-label={t('email')} onClick={(e) => { e.preventDefault(); window.location.href = `mailto:?subject=${encodeURIComponent(t('mailSubject'))}&body=${encodeURIComponent(`${t('mailBody')} ${compressionResults[0].fileName}`)}`; }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>{t('email')}</span>
                  </a>
                </div>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="message message--error" role="alert">
            {error}
          </div>
        )}

        {teaserBlogs.length > 0 && (isHomeLanding || (isCompressPage && step === STEP_SETTINGS)) && (
          <section className="blog-teaser" aria-label={t('fromTheBlog')}>
            <h2 className="blog-teaser-title">{t('fromTheBlog')}</h2>
            <ul className="blog-teaser-list">
              {teaserBlogs.slice(0, 6).map((post) => (
                <li key={post.id ?? post.slug}>
                  <Link to={`/${lang}/blog/${post.slug}`} className="blog-teaser-link">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to={`/${lang}/blog`} className="blog-teaser-all">
              {t('viewAllPosts')} →
            </Link>
          </section>
        )}

        {showBelowFold && !isCompressPage && faqItems.length > 0 && (
          <Suspense fallback={null}>
            <LandingFaqSection
              t={t}
              faqItems={faqItems}
              faqOpenIndex={faqOpenIndex}
              setFaqOpenIndex={setFaqOpenIndex}
            />
          </Suspense>
        )}
      </main>
    </div>
  )
}

export default HomePage
