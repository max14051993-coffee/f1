import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DateTime } from 'luxon';

import { parseSchedule, type ScheduleEvent } from '../lib/ics';
import { buildScheduleJsonLd } from '../lib/schema-org';

/**
 * Server component executed once at build time: it reads the committed
 * public/schedule.ics and bakes schema.org JSON-LD into the prerendered
 * HTML so crawlers see the events without executing JavaScript.
 */
export function ScheduleJsonLd() {
  let events: ScheduleEvent[] = [];
  try {
    const ics = readFileSync(path.join(process.cwd(), 'public', 'schedule.ics'), 'utf8');
    const nowIso = DateTime.utc().toISO()!;
    events = parseSchedule(ics)
      .filter(event => event.startsAtUtc >= nowIso)
      .sort((a, b) => a.startsAtUtc.localeCompare(b.startsAtUtc));
  } catch (error) {
    console.error('Failed to build schedule JSON-LD:', error);
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildScheduleJsonLd(events)) }}
    />
  );
}
