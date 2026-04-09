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

/**
 * Below-the-fold landing content (CMS feature cards, how it works).
 * Lazy-loaded and mounted after first paint to reduce TBT on mobile.
 */
export default function LandingBelowFold({ t, cards = [], howSection = null }) {
  const cardEmoji = (iconKey) => CARD_ICON_EMOJI[iconKey] ?? '✨'
  const style = String(howSection?.card_style || '').toLowerCase()
  const useNumberedCards = style === 'numbered'
  const showHowCards = cards.length > 0
  const howTitle = howSection?.title?.trim?.() || t('landing.howTitle')
  const howDescription = howSection?.description?.trim?.() || ''

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

      <section className="landing-section landing-how" aria-labelledby="landing-how-heading">
        <h2 id="landing-how-heading" className="landing-section-title">{howTitle}</h2>
        {howDescription && <p className="landing-section-subtitle">{howDescription}</p>}
        {showHowCards ? (
          <div className="landing-steps">
            {cards.map((card, idx) => (
              <div key={card.id ?? `${card.title}-${idx}`} className="landing-step">
                {useNumberedCards ? (
                  <span className="landing-step-num" aria-hidden="true">{idx + 1}</span>
                ) : (
                  <span className="landing-card-icon" aria-hidden="true">{cardEmoji(card.icon)}</span>
                )}
                <h3 className="landing-step-title">{card.title}</h3>
                <p className="landing-step-desc">{card.description || ''}</p>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </section>
    </>
  )
}
