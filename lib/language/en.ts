import type { LanguageDefinition } from './types';
import { formatCountdownStart } from './countdown';

export const en: LanguageDefinition = {
  code: 'en',
  name: 'English',
  shortName: 'EN',
  locale: 'en',
  periodOptions: [
    { label: '24 hours', value: 24 },
    { label: '48 hours', value: 48 },
    { label: '72 hours', value: 72 },
    { label: '7 days', value: 168 },
    { label: '30 days' },
  ],
  sessionLabels: {
    Qualifying: 'Qualifying',
    Race: 'Race',
    Sprint: 'Sprint',
  },
  texts: {
    heroTitle: 'My race weekend',
    heroSubtitle:
      'Stay in sync with race weekends: filter the series, adjust the viewing window, and track session times in your own timezone.',
    seriesLabel: 'Series',
    activeSelection: names => `Selected: ${names.join(' · ')}`,
    allSeriesHidden: 'All series hidden',
    reviewPeriodLabel: 'Viewing window',
    eventsInWindowLabel: 'Events in window',
    nextStartLabel: 'Next session',
    noEvents: 'No events',
    extendPeriodHint: 'Try expanding the window',
    countdownStart: relative => formatCountdownStart(relative, 'Starts', 'Starts in'),
    countdownLive: relative => (relative ? `Live now • started ${relative}` : 'Live now'),
    countdownFinish: relative => `Finished ${relative}`,
    countdownScheduled: 'On schedule',
    trackLayoutLabel: parts => (parts.length ? `Circuit layout: ${parts.join(' — ')}` : 'Circuit layout'),
    theme: {
      toggleToDark: 'Switch to dark theme',
      toggleToLight: 'Switch to light theme',
    },
    upcomingEventDescriptorFallback: 'No events',
    brandName: 'RaceSync',
    navFeatures: 'Features',
    navFaq: 'FAQ',
    heroCta: 'Browse schedule',
    scheduleTitle: 'Weekend feed',
    scheduleSubtitle: 'Live-updated start times aligned with your timezone.',
    scheduleLoadingLabel: 'Loading schedule…',
    scheduleErrorTitle: 'Could not load the schedule',
    scheduleErrorDescription: 'Please try again. If this keeps happening, open the schedule file directly.',
    scheduleRetryButton: 'Retry',
    scheduleErrorFallbackPrefix: 'Diagnostic file:',
    scheduleIcsLinkLabel: 'Open schedule.ics',
    featuresTitle: 'Why fans choose RaceSync',
    featuresSubtitle: 'Purpose-built utilities for race weekend planning.',
    features: [
      {
        title: 'Local time awareness',
        description:
          'Every session converts to your device timezone automatically — no manual math required.',
      },
      {
        title: 'Multi-series control',
        description: 'Toggle F1, F2, F3, or MotoGP with a tap and focus on the championships you follow.',
      },
      {
        title: 'Track visuals included',
        description: 'Instant circuit outlines add context to every round on the calendar.',
      },
    ],
    insightsTitle: 'How it works',
    insightsSubtitle: 'Three simple steps to stay ahead of lights out.',
    insightsSteps: [
      {
        title: 'Select your series',
        description: 'Keep the championships you care about visible and hide the rest.',
      },
      {
        title: 'Adjust the window',
        description: 'Expand the viewing horizon up to 30 days or zoom into the next 24 hours.',
      },
      {
        title: 'Watch the countdown',
        description: 'Live relative timers surface how soon each qualifying or race begins.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faqSubtitle: 'Quick answers to the most common topics from our community.',
    faqItems: [
      {
        question: 'Where does the data come from?',
        answer:
          'We ingest official championship calendars and refresh the live feed automatically as schedules update.',
      },
      {
        question: 'Is it mobile friendly?',
        answer: 'Yes. The layout adapts to phones and keeps your preferences in local storage.',
      },
      {
        question: 'Why can’t I see an event?',
        answer: 'Make sure the series is active and expand the viewing window if you need more coverage.',
      },
    ],
    ctaTitle: 'Ready for lights out?',
    ctaSubtitle: 'Open the live calendar, set your filters, and never miss a session.',
    ctaButton: 'Launch the calendar',
    footer: {
      tagline: 'RaceSync keeps global fans aligned with every race weekend.',
      productHeading: 'Product',
      resourcesHeading: 'Resources',
      supportHeading: 'Support',
      contactEmailLabel: 'Team email',
      contactEmail: 'hello@racesync.app',
      legal: '© {year} RaceSync. All rights reserved.',
      productLinks: [
        { label: 'Schedule', href: '#schedule' },
        { label: 'Features', href: '#features' },
        { label: 'How it works', href: '#insights' },
      ],
      resourcesLinks: [
        { label: 'FAQ', href: '#faq' },
        { label: 'Download .ics', href: './schedule.ics' },
      ],
      supportLinks: [
        { label: 'Email support', href: 'mailto:hello@racesync.app' },
        { label: 'Privacy policy', href: '#privacy' },
      ],
    },
    privacyPolicy: {
      title: 'Privacy policy',
      lastUpdated: 'Last updated: 20 March 2024',
      intro: [
        'RaceSync exists to help fans track motorsport schedules while collecting as little personal data as possible. This policy explains what information we process when you visit the website or subscribe to our calendars.',
      ],
      sections: [
        {
          title: 'Information we collect',
          paragraphs: ['We only gather the details that allow us to operate and improve the service.'],
          list: [
            'Contact information you voluntarily share when emailing hello@racesync.app.',
            'Anonymous analytics about page visits and feature usage.',
            'Technical logs generated automatically to keep the site secure and reliable.',
          ],
        },
        {
          title: 'How we use information',
          paragraphs: [
            'The collected data supports the ongoing development of RaceSync and ensures the experience stays stable for everyone.',
          ],
          list: [
            'Responding to questions or feedback you send by email.',
            'Understanding which sections and capabilities fans use most.',
            'Detecting technical issues and protecting the infrastructure from abuse.',
          ],
        },
        {
          title: 'Retention and security',
          paragraphs: [
            'Access to data is limited to the small RaceSync team. Analytics are stored in aggregate form so they cannot identify individual visitors.',
            'Messages you send are kept only as long as needed to resolve your request and are removed from active systems afterwards.',
          ],
        },
        {
          title: 'Your choices',
          paragraphs: [
            'You can limit anonymous analytics through your browser or blocking extensions. Contact us if you want to remove previously shared information and we will process the request promptly.',
          ],
        },
      ],
      conclusion:
        'Questions about privacy at RaceSync? Email hello@racesync.app and we will get back to you as soon as possible.',
      closeLabel: 'Close',
    },
  },
};
