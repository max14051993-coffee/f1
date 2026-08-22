export type LanguageCode = 'en' | 'ru' | 'es' | 'fr' | 'de' | 'zh';

export type RaceSession = 'Qualifying' | 'Race' | 'Sprint';

type FeatureDescriptor = {
  title: string;
  description: string;
};

type InsightDescriptor = {
  title: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type ThemeCopy = {
  toggleToDark: string;
  toggleToLight: string;
};

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterCopy = {
  tagline: string;
  productHeading: string;
  resourcesHeading: string;
  supportHeading: string;
  contactEmailLabel: string;
  contactEmail: string;
  legal: string;
  productLinks: FooterLink[];
  resourcesLinks: FooterLink[];
  supportLinks: FooterLink[];
};

type PrivacyPolicySection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

type PrivacyPolicyCopy = {
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: PrivacyPolicySection[];
  conclusion: string;
  closeLabel: string;
};

export type TranslationBundle = {
  heroTitle: string;
  heroSubtitle: string;
  seriesLabel: string;
  activeSelection: (names: string[]) => string;
  allSeriesHidden: string;
  reviewPeriodLabel: string;
  eventsInWindowLabel: string;
  nextStartLabel: string;
  noEvents: string;
  extendPeriodHint: string;
  countdownStart: (relative: string) => string;
  countdownLive: (relative: string) => string;
  countdownFinish: (relative: string) => string;
  countdownScheduled: string;
  trackLayoutLabel: (parts: string[]) => string;
  upcomingEventDescriptorFallback: string;
  brandName: string;
  navFeatures: string;
  navFaq: string;
  heroCta: string;
  scheduleTitle: string;
  scheduleSubtitle: string;
  scheduleLoadingLabel: string;
  scheduleErrorTitle: string;
  scheduleErrorDescription: string;
  scheduleRetryButton: string;
  scheduleErrorFallbackPrefix: string;
  scheduleIcsLinkLabel: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: FeatureDescriptor[];
  insightsTitle: string;
  insightsSubtitle: string;
  insightsSteps: InsightDescriptor[];
  faqTitle: string;
  faqSubtitle: string;
  faqItems: FaqItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  footer: FooterCopy;
  privacyPolicy: PrivacyPolicyCopy;
  theme: ThemeCopy;
};

export type LanguageDefinition = {
  code: LanguageCode;
  name: string;
  shortName: string;
  locale: string;
  periodOptions: { label: string; value?: number }[];
  sessionLabels: Record<RaceSession, string>;
  texts: TranslationBundle;
};
