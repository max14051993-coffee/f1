import type { ScheduleEvent } from './ics';
import { SITE_URL } from './site-url';

const MAX_SCHEMA_EVENTS = 50;

type JsonLdObject = Record<string, unknown>;

type FaqEntry = { question: string; answer: string };

/** Builds a schema.org ItemList of upcoming SportsEvents for search-engine rich results. */
export function buildScheduleJsonLd(events: ScheduleEvent[]): JsonLdObject {
  const itemListElement = events.slice(0, MAX_SCHEMA_EVENTS).map((event, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'SportsEvent',
      name: `${event.series} — ${event.round} (${event.session})`,
      startDate: event.startsAtUtc,
      ...(event.endsAtUtc ? { endDate: event.endsAtUtc } : {}),
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: event.circuit ?? event.round,
        ...(event.country ? { address: { '@type': 'PostalAddress', addressCountry: event.country } } : {}),
      },
      url: `${SITE_URL}/#schedule`,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement,
  };
}

export function buildFaqJsonLd(items: FaqEntry[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RaceSync',
    url: `${SITE_URL}/`,
    inLanguage: 'ru',
    description: 'F1, F2, F3 и MotoGP: расписание квалификаций, спринтов и гонок в вашем часовом поясе.',
    publisher: { '@type': 'Organization', name: 'RaceSync', url: `${SITE_URL}/` },
  };
}
