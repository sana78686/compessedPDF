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
 * Below-the-fold landing content (home rich text, FAQ, features, how it works).
 * Home content from CMS is shown above FAQ when present. FAQ and Cards render only when CMS has data.
 * Lazy-loaded and mounted after first paint to reduce TBT on mobile.
 */
export default function LandingBelowFold({ t, homeContent = '', faqItems, faqOpenIndex, setFaqOpenIndex, cards = [] }) {
  const cardEmoji = (iconKey) => CARD_ICON_EMOJI[iconKey] ?? '✨'
  const hasHomeContent = typeof homeContent === 'string' && homeContent.trim().length > 0

  return (
    <>
      {hasHomeContent && (
        <section className="landing-section landing-home-content" aria-label="Home page content">
          <div
            className="landing-home-content-body"
            dangerouslySetInnerHTML={{ __html: homeContent }}
          />
        </section>
      )}
      {faqItems.length > 0 && (
        <section className="landing-section landing-faq" aria-labelledby="landing-faq-heading">
          <h2 id="landing-faq-heading" className="landing-section-title">{t('landing.faqTitle')}</h2>
          <div className="landing-faq-list" role="list">
            {faqItems.map((item, i) => (
              <div key={i} className={`landing-faq-item ${faqOpenIndex === i ? 'landing-faq-item--open' : ''}`} role="listitem">
                <button
                  type="button"
                  className="landing-faq-question"
                  onClick={() => setFaqOpenIndex((prev) => (prev === i ? null : i))}
                  aria-expanded={faqOpenIndex === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  <span>{item.q}</span>
                  <span className="landing-faq-chevron" aria-hidden="true">{faqOpenIndex === i ? '−' : '+'}</span>
                </button>
                <div id={`faq-answer-${i}`} className="landing-faq-answer" role="region" aria-labelledby={`faq-question-${i}`} hidden={faqOpenIndex !== i}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
        <h2 id="landing-how-heading" className="landing-section-title">{t('landing.howTitle')}</h2>
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
    </>
  )
}
