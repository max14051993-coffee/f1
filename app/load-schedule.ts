import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DateTime } from 'luxon';

import { parseSchedule, type ScheduleEvent } from '../lib/ics';

/**
 * Build-time helper (server components only): reads the committed
 * public/schedule.ics and returns upcoming events, soonest first.
 */
export function loadUpcomingEvents(): ScheduleEvent[] {
  try {
    const ics = readFileSync(path.join(process.cwd(), 'public', 'schedule.ics'), 'utf8');
    const nowIso = DateTime.utc().toISO()!;
    return parseSchedule(ics)
      .filter(event => event.startsAtUtc >= nowIso)
      .sort((a, b) => a.startsAtUtc.localeCompare(b.startsAtUtc));
  } catch (error) {
    console.error('Failed to load schedule for prerender:', error);
    return [];
  }
}
