import { DateTime } from 'luxon';

import { buildRelativeLabel } from './relative-time';
import type { ScheduleEvent } from './ics';
import type { LanguageCode } from './language';
import type { SeriesId } from './series';

export type EventStatus = 'upcoming' | 'live' | 'finished';

export type LocalizedScheduleEvent = {
  event: ScheduleEvent;
  localStart: DateTime;
  localEnd: DateTime | null;
  startRelative: string | null;
  finishRelative: string | null;
  status: EventStatus;
};

type CountdownCopy = {
  countdownLive: (relative: string) => string;
  countdownFinish: (relative: string) => string;
  countdownStart: (relative: string) => string;
  countdownScheduled: string;
};

export function filterEventsByVisibility(
  events: ScheduleEvent[],
  visibleSeries: Record<SeriesId, boolean>,
  hours?: number,
  now: DateTime = DateTime.utc(),
) {
  const limit = hours && hours > 0 ? hours : 24 * 30;
  const from = now.minus({ hours: 2 });
  const to = now.plus({ hours: limit });

  return events
    .filter(event => visibleSeries[event.series])
    .filter(event => {
      const startUtc = DateTime.fromISO(event.startsAtUtc, { zone: 'utc' });
      const endUtcRaw = event.endsAtUtc ? DateTime.fromISO(event.endsAtUtc, { zone: 'utc' }) : null;
      const endUtc = endUtcRaw && endUtcRaw.isValid ? endUtcRaw : null;
      const startsWithinWindow = startUtc >= from && startUtc <= to;
      const endsAfterFrom = endUtc ? endUtc >= from : false;
      const startsBeforeTo = startUtc <= to;
      return (startsWithinWindow || endsAfterFrom) && startsBeforeTo;
    })
    .slice()
    .sort((a, b) => Date.parse(a.startsAtUtc) - Date.parse(b.startsAtUtc));
}

export function localizeEvent(
  event: ScheduleEvent,
  userTz: string,
  locale: LanguageCode,
  nowLocal: DateTime,
): LocalizedScheduleEvent {
  const localStart = DateTime.fromISO(event.startsAtUtc, { zone: 'utc' })
    .setZone(userTz)
    .setLocale(locale);
  const endLocalRaw = event.endsAtUtc
    ? DateTime.fromISO(event.endsAtUtc, { zone: 'utc' }).setZone(userTz)
    : null;
  const localEnd = endLocalRaw && endLocalRaw.isValid ? endLocalRaw.setLocale(locale) : null;
  const startRelative = buildRelativeLabel(localStart, nowLocal, locale);
  const finishRelative = localEnd ? buildRelativeLabel(localEnd, nowLocal, locale) : null;

  let status: EventStatus = 'upcoming';
  if (localEnd && localEnd <= nowLocal) {
    status = 'finished';
  } else if (localStart <= nowLocal) {
    status = 'live';
  }

  return {
    event,
    localStart,
    localEnd,
    startRelative,
    finishRelative,
    status,
  };
}

export function buildCountdownLabel(
  status: EventStatus,
  startRelative: string | null,
  finishRelative: string | null,
  copy: CountdownCopy,
) {
  if (status === 'live') {
    return copy.countdownLive(startRelative ?? '');
  }

  if (status === 'finished') {
    if (finishRelative) {
      return copy.countdownFinish(finishRelative);
    }
    if (startRelative) {
      return copy.countdownFinish(startRelative);
    }
    return copy.countdownScheduled;
  }

  return startRelative ? copy.countdownStart(startRelative) : copy.countdownScheduled;
}
