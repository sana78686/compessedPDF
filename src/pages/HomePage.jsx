import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './HomePage.css'

const STEP_UPLOAD = 1
const STEP_SETTINGS = 2
const STEP_RESULT = 3

const COLOR_OPTIONS = [
  { value: 'no-change', label: 'No change' },
  { value: 'gray', label: 'Gray' },
]

function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const isCompressPage = pathname === '/en/compress'

  const [step, setStep] = useState(STEP_UPLOAD)
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [settings, setSettings] = useState({
    dpi: 144,
    imageQuality: 75,
    color: 'no-change',
  })
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState({ message: '' })
  const [error, setError] = useState(null)
  const [compressedBlob, setCompressedBlob] = useState(null)
  const [resultStats, setResultStats] = useState(null)
  const [resultFileName, setResultFileName] = useState('')
  const fileInputRef = useRef(null)

  // Sync URL with state: on /en/compress with no files -> go to upload
  useEffect(() => {
    if (isCompressPage && files.length === 0) {
      navigate('/en', { replace: true })
    }
  }, [isCompressPage, files.length, navigate])

  const handleFileSelect = useCallback((e) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type === 'application/pdf')
    if (selected.length) {
      setFiles((prev) => [...prev, ...selected])
      setError(null)
      setStep(STEP_SETTINGS)
      navigate('/en/compress', { replace: true })
    }
    e.target.value = ''
  }, [navigate])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) => f.type === 'application/pdf')
    if (dropped.length) {
      setFiles((prev) => [...prev, ...dropped])
      setError(null)
      setStep(STEP_SETTINGS)
      navigate('/en/compress', { replace: true })
    }
  }, [navigate])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    if (!next.length) {
      setStep(STEP_UPLOAD)
      navigate('/en', { replace: true })
    }
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  const addMoreFiles = () => fileInputRef.current?.click()

  // Load PDF via object URL so the worker fetches it — avoids transferring ArrayBuffer (detached buffer error)
  const loadPdfFromUrl = async (pdfjsLib, url) => {
    const pdf = await pdfjsLib.getDocument({ url }).promise
    return pdf
  }

  const applyGrayscaleToPdf = async (arrayBuffer) => {
    const [pdfjsLib, { jsPDF }] = await Promise.all([
      import('pdfjs-dist'),
      import('jspdf'),
    ])
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.js/pdf.worker.min.mjs`
    }
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    try {
      const pdf = await loadPdfFromUrl(pdfjsLib, url)
      const numPages = pdf.numPages
      const doc = new jsPDF({ unit: 'px', compress: true })
      const scale = Math.min(2, (settings.dpi || 144) / 72)
      const quality = (settings.imageQuality || 75) / 100

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
    if (!files.length) return
    setError(null)
    setCompressedBlob(null)
    setResultStats(null)
    setIsCompressing(true)
    setProgress({ message: 'Initializing…' })

    let blobUrl = null
    try {
      const file = files[0]
      const originalSize = file.size
      const dpi = Math.max(72, Math.min(300, Number(settings.dpi) || 144))
      const quality = Math.max(0.1, Math.min(1, (Number(settings.imageQuality) || 75) / 100))
      const scale = Math.min(2.5, dpi / 72)

      const [pdfjsLib, { jsPDF }] = await Promise.all([
        import('pdfjs-dist'),
        import('jspdf'),
      ])
      if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.js/pdf.worker.min.mjs`
      }

      blobUrl = URL.createObjectURL(file)
      setProgress({ message: 'Loading PDF…' })
      const pdf = await loadPdfFromUrl(pdfjsLib, blobUrl)
      const numPages = pdf.numPages
      const doc = new jsPDF({ unit: 'px', compress: true })

      for (let i = 1; i <= numPages; i++) {
        setProgress({ message: `Compressing page ${i}/${numPages}…` })
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

      setProgress({ message: 'Finalizing…' })
      let outputBuffer = doc.output('arraybuffer')

      if (settings.color === 'gray') {
        setProgress({ message: 'Applying grayscale…' })
        outputBuffer = await applyGrayscaleToPdf(outputBuffer)
      }

      const blob = new Blob([outputBuffer], { type: 'application/pdf' })
      const newSize = blob.size
      const percentageSaved = originalSize > 0
        ? ((1 - newSize / originalSize) * 100)
        : 0

      setCompressedBlob(blob)
      setResultStats({
        originalSize,
        newSize,
        percentageSaved,
      })
      setResultFileName(String(file.name || 'document').replace(/\.pdf$/i, '') + '-compressed.pdf')
      setStep(STEP_RESULT)
    } catch (err) {
      const msg = err?.message != null ? String(err.message) : ''
      const cause = err?.underlyingError?.message ?? err?.cause?.message
      const causeStr = cause != null ? String(cause) : ''
      const message = causeStr
        ? `${msg || 'Compression failed'}: ${causeStr}`
        : (msg || 'Compression failed. Please try again.')
      setError(message)
    } finally {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      setIsCompressing(false)
      setProgress({ message: '' })
    }
  }

  const handleDownload = () => {
    if (!compressedBlob) return
    const url = URL.createObjectURL(compressedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = resultFileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePreview = () => {
    if (!compressedBlob) return
    const url = URL.createObjectURL(compressedBlob)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleErase = () => {
    if (compressedBlob) URL.revokeObjectURL(URL.createObjectURL(compressedBlob))
    setCompressedBlob(null)
    setResultStats(null)
    setResultFileName('')
    setStep(STEP_SETTINGS)
  }

  const handleRestart = () => {
    if (compressedBlob) URL.revokeObjectURL(URL.createObjectURL(compressedBlob))
    setCompressedBlob(null)
    setResultStats(null)
    setResultFileName('')
    setFiles([])
    setStep(STEP_UPLOAD)
    setError(null)
    navigate('/en', { replace: true })
  }

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-inner">
          <a href="/en" className="logo" aria-label="Home">
            I <span className="logo-heart">❤</span> PDF
          </a>
          <nav className="nav" aria-label="Main navigation">
            <a href="/en/merge">MERGE PDF</a>
            <a href="/en/split">SPLIT PDF</a>
            <a href="/en" className={pathname.startsWith('/en') && (pathname === '/en' || pathname === '/en/compress') ? 'nav-active' : ''}>COMPRESS PDF</a>
            <a href="/en/convert">CONVERT PDF</a>
            <a href="/en/tools">ALL PDF TOOLS</a>
          </nav>
          <div className="header-actions">
            <a href="/en/login">Login</a>
            <button type="button" className="btn-signup">
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="main" tabIndex="-1">
        <h1 className="main-title">Compress PDF files</h1>
        <p className="main-subtitle">
          Reduce file size while optimizing for maximal PDF quality.
        </p>

        <input
          ref={fileInputRef}
          id="pdf-file-input"
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileSelect}
          className="sr-only"
          aria-label="Select PDF files"
        />

        {/* Step 1: Upload (only on /en) */}
        {!isCompressPage && (
          <div
            className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="upload-actions">
              <button
                type="button"
                className="btn-select-pdf"
                onClick={triggerFileInput}
                aria-label="Select PDF files"
              >
                Select PDF files
              </button>
              <div className="upload-icons">
                <button type="button" className="icon-btn" aria-label="Upload from cloud" title="From cloud">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                    <path d="M12 16v-8M9 11l3-3 3 3" />
                  </svg>
                </button>
                <button type="button" className="icon-btn" aria-label="Other sources" title="Other sources">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="upload-hint">or drop PDFs here</p>
          </div>
        )}

        {/* Step 2: Settings + file list (only on /en/compress) */}
        {isCompressPage && step === STEP_SETTINGS && (
          <section className="step-settings" aria-label="Compression settings">
            <div className="file-display-zone">
              <div className="file-display-header">
                <span className="file-badge">✓ File protection is active</span>
                <button type="button" className="link-add-more" onClick={addMoreFiles}>
                  Add more files
                </button>
              </div>
              <ul className="file-cards">
                {files.map((file, i) => (
                  <li key={`${file.name}-${i}`} className="file-card">
                    <div className="file-card-preview">
                      <span className="file-card-icon">PDF</span>
                    </div>
                    <span className="file-card-name" title={file.name}>{file.name}</span>
                    <button
                      type="button"
                      className="file-card-remove"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${file.name}`}
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
                  <span>DPI</span>
                  <input
                    type="number"
                    min="72"
                    max="300"
                    value={settings.dpi}
                    onChange={(e) => setSettings((s) => ({ ...s, dpi: Number(e.target.value) || 144 }))}
                    className="setting-input"
                  />
                </label>
                <label className="setting-label">
                  <span>Image quality</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.imageQuality}
                    onChange={(e) => setSettings((s) => ({ ...s, imageQuality: Number(e.target.value) || 75 }))}
                    className="setting-input"
                  />
                  <span className="setting-suffix">%</span>
                </label>
                <label className="setting-label">
                  <span>Color</span>
                  <select
                    value={settings.color}
                    onChange={(e) => setSettings((s) => ({ ...s, color: e.target.value }))}
                    className="setting-select"
                    aria-label="Color mode"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                className="btn-compress-large"
                onClick={runCompress}
                disabled={isCompressing}
              >
                {isCompressing ? 'Compressing…' : 'Compress'}
              </button>
            </div>
            {isCompressing && progress.message && (
              <p className="progress-message" role="status">{progress.message}</p>
            )}
          </section>
        )}

        {/* Step 3: Result + actions (only on /en/compress) */}
        {isCompressPage && step === STEP_RESULT && compressedBlob && resultStats && (
          <section className="step-result" aria-label="Compression result">
            <div className="result-banner">
              <span className="result-settings">
                DPI: {settings.dpi}, Image quality: {settings.imageQuality}%, Color: {settings.color === 'gray' ? 'Gray' : 'No change'}
              </span>
            </div>
            <p className="result-title">
              The size has been reduced by <strong>{resultStats.percentageSaved?.toFixed(2) ?? 0}%</strong>.
            </p>
            <p className="result-filename">
              {resultFileName} – {(compressedBlob.size / 1024).toFixed(2)} KB
            </p>
            <div className="result-actions">
              <button type="button" className="btn-action btn-download" onClick={handleDownload}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download
              </button>
              <button type="button" className="btn-action btn-preview" onClick={handlePreview}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Preview
              </button>
              <button type="button" className="btn-action btn-erase" onClick={handleErase}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                </svg>
                Erase
              </button>
              <button type="button" className="btn-action btn-restart" onClick={handleRestart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                </svg>
                Restart
              </button>
            </div>
            <div className="result-share">
              <span className="result-share-label">Share or continue</span>
              <div className="result-share-btns">
                <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Google Drive">
                  <span className="share-icon gdrive" aria-hidden="true">G</span>
                  <span>Google Drive</span>
                </a>
                <a href="https://dropbox.com" target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Dropbox">
                  <span className="share-icon dropbox" aria-hidden="true">D</span>
                  <span>Dropbox</span>
                </a>
                <a href="#" className="share-btn" aria-label="Email" onClick={(e) => { e.preventDefault(); window.location.href = `mailto:?subject=Compressed PDF&body=Download: ${resultFileName}`; }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Email</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="message message--error" role="alert">
            {error}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 – Your PDF Editor</p>
      </footer>
    </div>
  )
}

export default HomePage
