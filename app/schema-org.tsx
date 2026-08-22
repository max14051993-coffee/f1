import { DEFAULT_LANGUAGE, LANGUAGE_DEFINITIONS } from '../lib/language';
import { buildFaqJsonLd, buildScheduleJsonLd, buildWebSiteJsonLd } from '../lib/schema-org';
import { loadUpcomingEvents } from './load-schedule';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/**
 * Server component executed once at build time: bakes schema.org structured
 * data (upcoming events, FAQ, website identity) into the exported HTML so
 * crawlers see it without executing JavaScript.
 */
export function ScheduleJsonLd() {
  const events = loadUpcomingEvents();

  if (events.length === 0) {
    return null;
  }

  const faqItems = LANGUAGE_DEFINITIONS[DEFAULT_LANGUAGE].texts.faqItems;

  return (
    <>
      <JsonLd data={buildScheduleJsonLd(events)} />
      <JsonLd data={buildFaqJsonLd(faqItems)} />
      <JsonLd data={buildWebSiteJsonLd()} />
    </>
  );
}
