import { DateTime } from 'luxon';

import type { ScheduleEvent } from './ics';

export const SCHEDULE_URL = './schedule.ics';

function escapeIcsText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toIcsUtc(value: string) {
  const dt = DateTime.fromISO(value, { zone: 'utc' });
  return dt.isValid ? dt.toFormat("yyyyMMdd'T'HHmmss'Z'") : null;
}

export function buildEventIcsFile(event: ScheduleEvent) {
  return `${event.round.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() || 'racesync-event'}.ics`;
}

export function buildEventIcsDeepLink(event: ScheduleEvent) {
  const dtStart = toIcsUtc(event.startsAtUtc);
  if (!dtStart) {
    return SCHEDULE_URL;
  }
  const dtEnd =
    toIcsUtc(event.endsAtUtc ?? '') ??
    DateTime.fromISO(event.startsAtUtc, { zone: 'utc' })
      .plus({ hours: 2 })
      .toFormat("yyyyMMdd'T'HHmmss'Z'");
  const uid = event.uid ?? `${event.series}-${event.startsAtUtc}`.replace(/[^a-zA-Z0-9@._-]/g, '');
  const summary = escapeIcsText(`${event.series} · ${event.round} · ${event.session}`);
  const location = escapeIcsText([event.circuit, event.country].filter(Boolean).join(', '));
  const description = escapeIcsText(`Added from RaceSync: ${event.round}`);
  const payload = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RaceSync//Schedule//EN',
    'BEGIN:VEVENT',
    `UID:${uid}@racesync.app`,
    `DTSTAMP:${DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'")}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(payload)}`;
}
