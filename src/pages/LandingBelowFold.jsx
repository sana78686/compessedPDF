/** Icon key → emoji for CMS-driven cards (match CMS list). */
const CARD_ICON_EMOJI = {
  lightning: '⚡',
  quality: '🎚️',
  lock: '🔒',
  star: '✨',
  document: '📄',
  shield: '🛡️',
  heart: '❤️',
  cloud: '☁️',
  download: '⬇️',
  upload: '⬆️',
  check: '✅',
  image: '🖼️',
  'file-plus': '📎',
  layers: '📑',
  sparkle: '✨',
  zap: '⚡',
  settings: '⚙️',
  globe: '🌐',
  mobile: '📱',
  clock: '⏱️',
}

function renderMediaIcon(item, idx) {
  const type = String(item.media_type || '').toLowerCase()
  const val = String(item.media_value || '').trim()
  if (type === 'number' || type === 'numbered') {
    return <span className="landing-step-num" aria-hidden="true">{val || idx + 1}</span>
  }
  if (type === 'fa-icon' && val) {
    return <i className={val} aria-hidden="true" />
  }
  if (type === 'icon' && val && CARD_ICON_EMOJI[val]) {
    return <span className="landing-card-icon" aria-hidden="true">{CARD_ICON_EMOJI[val]}</span>
  }
  if (type === 'image' && val) {
    return <img src={val} alt="" className="landing-step-img" loading="lazy" aria-hidden="true" />
  }
  return <span className="landing-step-num" aria-hidden="true">{idx + 1}</span>
}

/**
 * Below-the-fold landing content: CMS feature cards (Use Cards) + dynamic Sections.
 * Lazy-loaded and mounted after first paint to reduce TBT on mobile.
 */
export default function LandingBelowFold({ t, cards = [], howSection = null, sections = [] }) {
  const cardEmoji = (iconKey) => CARD_ICON_EMOJI[iconKey] ?? '✨'

  return (
    <>
      {cards.length > 0 && (
        <section className="landing-section landing-features" aria-labelledby="landing-features-heading">
          <h2 id="landing-features-heading" className="landing-section-title">{t('landing.featuresTitle')}</h2>
          <div className="landing-cards">
            {cards.map((card) => (
              <div key={card.id} className="landing-card">
                <span className="landing-card-icon" aria-hidden="true">{cardEmoji(card.icon)}</span>
                <h3 className="landing-card-title">{card.title}</h3>
                <p className="landing-card-desc">{card.description || ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.map((sec) => {
        const items = Array.isArray(sec.items) ? sec.items : []
        if (!items.length) return null
        const sectionId = `cms-section-${sec.id}`
        return (
          <section key={sec.id} className="landing-section landing-how" aria-labelledby={sectionId}>
            <h2 id={sectionId} className="landing-section-title">{sec.title || ''}</h2>
            {sec.description && <p className="landing-section-subtitle">{sec.description}</p>}
            <div className="landing-steps">
              {items.map((item, idx) => (
                <div key={item.id ?? idx} className="landing-step">
                  {renderMediaIcon(item, idx)}
                  <h3 className="landing-step-title">{item.title || ''}</h3>
                  <p className="landing-step-desc">{item.description || ''}</p>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {sections.length === 0 && (
        <section className="landing-section landing-how" aria-labelledby="landing-how-heading">
          <h2 id="landing-how-heading" className="landing-section-title">
            {howSection?.title?.trim?.() || t('landing.howTitle')}
          </h2>
          {howSection?.description?.trim?.() && (
            <p className="landing-section-subtitle">{howSection.description.trim()}</p>
          )}
          <div className="landing-steps">
            <div className="landing-step">
              <span className="landing-step-num" aria-hidden="true">1</span>
              <h3 className="landing-step-title">{t('landing.howStep1')}</h3>
              <p className="landing-step-desc">{t('landing.howStep1Desc')}</p>
            </div>
            <div className="landing-step">
              <span className="landing-step-num" aria-hidden="true">2</span>
              <h3 className="landing-step-title">{t('landing.howStep2')}</h3>
              <p className="landing-step-desc">{t('landing.howStep2Desc')}</p>
            </div>
            <div className="landing-step">
              <span className="landing-step-num" aria-hidden="true">3</span>
              <h3 className="landing-step-title">{t('landing.howStep3')}</h3>
              <p className="landing-step-desc">{t('landing.howStep3Desc')}</p>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
