'use client';

import type { TranslationBundle } from '../../lib/language';

export function InfoSections({ texts }: { texts: TranslationBundle }) {
  return (
    <>
      <section id="features" className="features-section" aria-labelledby="features-heading">
        <div className="section-heading">
          <h2 id="features-heading" className="section-heading__title">
            {texts.featuresTitle}
          </h2>
          <p className="section-heading__description">{texts.featuresSubtitle}</p>
        </div>
        <div className="feature-grid">
          {texts.features.map((feature, index) => (
            <article key={`${feature.title}-${index}`} className="feature-card" data-index={index}>
              <div className="feature-card__icon" aria-hidden>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="insights" className="insights-section" aria-labelledby="insights-heading">
        <div className="section-heading">
          <h2 id="insights-heading" className="section-heading__title">
            {texts.insightsTitle}
          </h2>
          <p className="section-heading__description">{texts.insightsSubtitle}</p>
        </div>
        <ol className="insights-list">
          {texts.insightsSteps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="insights-item">
              <span className="insights-item__number">{String(index + 1).padStart(2, '0')}</span>
              <div className="insights-item__content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="faq-section" aria-labelledby="faq-heading">
        <div className="section-heading">
          <h2 id="faq-heading" className="section-heading__title">
            {texts.faqTitle}
          </h2>
          <p className="section-heading__description">{texts.faqSubtitle}</p>
        </div>
        <div className="faq-list">
          {texts.faqItems.map((item, index) => (
            <details key={`${item.question}-${index}`} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="cta" className="cta-section" aria-labelledby="cta-heading">
        <div className="cta-section__inner">
          <div className="cta-section__content">
            <h2 id="cta-heading">{texts.ctaTitle}</h2>
            <p>{texts.ctaSubtitle}</p>
          </div>
          <a className="cta-section__button" href="#schedule">
            {texts.ctaButton}
          </a>
        </div>
      </section>
    </>
  );
}
