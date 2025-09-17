import { describe, expect, it } from 'vitest';

import { DEFAULT_LANGUAGE, LANGUAGE_CODES, LANGUAGE_DEFINITIONS } from '../lib/language';

describe('localization configuration', () => {
  it('includes all expected language codes', () => {
    const expected = ['ru', 'en', 'es', 'fr', 'de', 'zh'];
    expect(new Set(LANGUAGE_CODES)).toEqual(new Set(expected));
  });

  it('has a default language that is part of the supported list', () => {
    expect(LANGUAGE_CODES).toContain(DEFAULT_LANGUAGE);
  });

  for (const code of LANGUAGE_CODES) {
    const definition = LANGUAGE_DEFINITIONS[code];

    describe(`language: ${code}`, () => {
      it('has consistent metadata', () => {
        expect(definition).toBeTruthy();
        expect(definition.code).toBe(code);
        expect(definition.name).toBeTruthy();
        expect(definition.locale).toMatch(/[a-z]{2}/i);
        expect(definition.periodOptions.length).toBeGreaterThan(0);
        for (const option of definition.periodOptions) {
          expect(option.label.trim().length).toBeGreaterThan(0);
          if (option.value !== undefined) {
            expect(option.value).toBeGreaterThan(0);
          }
        }
      });

      it('maps all race sessions to localized labels', () => {
        const labels = definition.sessionLabels;
        expect(labels.Qualifying.trim().length).toBeGreaterThan(0);
        expect(labels.Race.trim().length).toBeGreaterThan(0);
        expect(labels.Sprint.trim().length).toBeGreaterThan(0);
      });

      it('provides a complete translation bundle', () => {
        const { texts } = definition;
        expect(texts.heroBadge.trim().length).toBeGreaterThan(0);
        const sampleTitle = texts.heroTitle('F1 / F2');
        expect(sampleTitle).toMatch(/F1/);
        expect(texts.heroSubtitle.trim().length).toBeGreaterThan(0);
        expect(texts.seriesLabel.trim().length).toBeGreaterThan(0);
        expect(texts.activeSelection(['F1']).trim().length).toBeGreaterThan(0);
        expect(texts.allSeriesHidden.trim().length).toBeGreaterThan(0);
        expect(texts.reviewPeriodLabel.trim().length).toBeGreaterThan(0);
        expect(texts.eventsInWindowLabel.trim().length).toBeGreaterThan(0);
        expect(texts.nextStartLabel.trim().length).toBeGreaterThan(0);
        expect(texts.noEvents.trim().length).toBeGreaterThan(0);
        expect(texts.extendPeriodHint.trim().length).toBeGreaterThan(0);
        expect(texts.countdownStart('через 5 минут').trim().length).toBeGreaterThan(0);
        expect(texts.countdownFinish('через 5 минут').trim().length).toBeGreaterThan(0);
        expect(texts.countdownScheduled.trim().length).toBeGreaterThan(0);
        expect(texts.trackLayoutLabel(['Circuit', 'Round']).trim().length).toBeGreaterThan(0);
        expect(texts.trackLayoutUnavailable.trim().length).toBeGreaterThan(0);
        expect(texts.languageLabel.trim().length).toBeGreaterThan(0);
        expect(texts.seriesLogoAria('F1').trim().length).toBeGreaterThan(0);
        expect(texts.upcomingEventDescriptorFallback.trim().length).toBeGreaterThan(0);
        expect(texts.brandName.trim().length).toBeGreaterThan(0);
        expect(texts.navFeatures.trim().length).toBeGreaterThan(0);
        expect(texts.navFaq.trim().length).toBeGreaterThan(0);
        expect(texts.heroCta.trim().length).toBeGreaterThan(0);
        expect(texts.scheduleTitle.trim().length).toBeGreaterThan(0);
        expect(texts.scheduleSubtitle.trim().length).toBeGreaterThan(0);
        expect(texts.featuresTitle.trim().length).toBeGreaterThan(0);
        expect(texts.featuresSubtitle.trim().length).toBeGreaterThan(0);

        expect(texts.features.length).toBeGreaterThanOrEqual(3);
        for (const feature of texts.features) {
          expect(feature.title.trim().length).toBeGreaterThan(0);
          expect(feature.description.trim().length).toBeGreaterThan(0);
        }

        expect(texts.insightsTitle.trim().length).toBeGreaterThan(0);
        expect(texts.insightsSubtitle.trim().length).toBeGreaterThan(0);
        expect(texts.insightsSteps.length).toBeGreaterThanOrEqual(3);
        for (const step of texts.insightsSteps) {
          expect(step.title.trim().length).toBeGreaterThan(0);
          expect(step.description.trim().length).toBeGreaterThan(0);
        }

        expect(texts.faqTitle.trim().length).toBeGreaterThan(0);
        expect(texts.faqSubtitle.trim().length).toBeGreaterThan(0);
        expect(texts.faqItems.length).toBeGreaterThanOrEqual(3);
        for (const item of texts.faqItems) {
          expect(item.question.trim().length).toBeGreaterThan(0);
          expect(item.answer.trim().length).toBeGreaterThan(0);
        }

        expect(texts.ctaTitle.trim().length).toBeGreaterThan(0);
        expect(texts.ctaSubtitle.trim().length).toBeGreaterThan(0);
        expect(texts.ctaButton.trim().length).toBeGreaterThan(0);

        const footer = texts.footer;
        expect(footer.tagline.trim().length).toBeGreaterThan(0);
        expect(footer.productHeading.trim().length).toBeGreaterThan(0);
        expect(footer.resourcesHeading.trim().length).toBeGreaterThan(0);
        expect(footer.supportHeading.trim().length).toBeGreaterThan(0);
        expect(footer.contactEmailLabel.trim().length).toBeGreaterThan(0);
        expect(footer.contactEmail.trim().length).toBeGreaterThan(0);
        expect(footer.legal.includes('{year}')).toBe(true);
        expect(footer.productLinks.length).toBeGreaterThan(0);
        expect(footer.resourcesLinks.length).toBeGreaterThan(0);
        expect(footer.supportLinks.length).toBeGreaterThan(0);
        for (const linkGroup of [
          footer.productLinks,
          footer.resourcesLinks,
          footer.supportLinks,
        ]) {
          for (const link of linkGroup) {
            expect(link.label.trim().length).toBeGreaterThan(0);
            expect(link.href.trim().length).toBeGreaterThan(0);
          }
        }
      });
    });
  }
});
