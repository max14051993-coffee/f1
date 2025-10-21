import { DateTime } from 'luxon';

import type { RaceSession, ScheduleEvent, SeriesId } from './types';

const SERIES_IDS: SeriesId[] = ['F1', 'F2', 'F3', 'MotoGP'];

const ICS_DATE_FORMATS: Array<[string, { zone: string }]> = [
  ["yyyyMMdd'T'HHmmss'Z'", { zone: 'utc' }],
  ["yyyyMMdd'T'HHmmss", { zone: 'utc' }],
  ['yyyyMMdd', { zone: 'utc' }],
];

function isSeriesId(value: string): value is SeriesId {
  return SERIES_IDS.includes(value as SeriesId);
}

function parseIcsDateTime(raw: string | undefined, tzHint?: string) {
  if (!raw) return null;

  const normalizedTz = tzHint && tzHint.trim().length > 0 ? tzHint : undefined;
  const attempts: Array<[string, { zone: string }]> = [
    ...ICS_DATE_FORMATS.slice(0, 1),
    ["yyyyMMdd'T'HHmmss", { zone: normalizedTz ?? 'utc' }],
    ['yyyyMMdd', { zone: normalizedTz ?? 'utc' }],
  ];

  for (const [format, options] of attempts) {
    const dt = DateTime.fromFormat(raw, format, options);
    if (dt.isValid) return dt;
  }

  return null;
}

function normalizeSession(raw: string): RaceSession | undefined {
  const trimmed = raw.trim();
  if (!trimmed.length) return undefined;

  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  if (lower.includes('sprint') || upper === 'SPR') {
    if (lower.includes('qual')) return 'Qualifying';
    return 'Sprint';
  }
  if (lower.includes('qual') || /^Q\d+$/.test(upper)) return 'Qualifying';
  if (lower.includes('feature')) return 'Race';
  if (lower.includes('race') || upper === 'RAC' || lower === 'grand prix' || upper === 'GP') return 'Race';
  return undefined;
}

function extractLocationParts(location?: string) {
  if (!location) return [];
  const normalized = location.replace(/\\,/g, ',').replace(/\\\\/g, '\\');
  return normalized
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function sanitizeRoundLabel(round: string | undefined, circuit?: string, country?: string) {
  const trimmed = round?.replace(/\s+/g, ' ').trim();
  if (trimmed && trimmed.length > 0) return trimmed;
  if (country) return `${country} MotoGP`;
  if (circuit) return circuit;
  return 'MotoGP';
}

export function parseSchedule(ics: string, fallbackSeriesId: SeriesId = 'F1'): ScheduleEvent[] {
  const lines = ics.split(/\r?\n/);
  const events: ScheduleEvent[] = [];
  let current: Record<string, string> = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }

    if (line === 'END:VEVENT') {
      const summary = current.SUMMARY;
      const dtstart = current.DTSTART;
      if (!summary || !dtstart) {
        current = {};
        continue;
      }

      const categories = current.CATEGORIES
        ? current.CATEGORIES.split(',').map(part => part.trim()).filter(Boolean)
        : [];
      const isMotoGpEvent =
        categories.some(cat => cat.toLowerCase() === 'motogp') || /^MotoGP\b/i.test(summary);

      if (summary.includes('|')) {
        const parts = summary.split('|').map(part => part.trim());
        if (parts.length >= 5) {
          const [seriesRaw, roundRaw, countryRaw, circuitRaw, sessionRaw] = parts;
          if (isSeriesId(seriesRaw)) {
            const start = parseIcsDateTime(dtstart, current.DTSTART_TZID);
            if (start) {
              const session = normalizeSession(sessionRaw);
              if (session) {
                const round = roundRaw.trim();
                const country = countryRaw.trim();
                const circuit = circuitRaw.trim();
                const end = parseIcsDateTime(current.DTEND, current.DTEND_TZID ?? current.DTSTART_TZID);

                events.push({
                  series: seriesRaw,
                  round,
                  country: country.length ? country : undefined,
                  circuit: circuit.length ? circuit : undefined,
                  session,
                  startsAtUtc: start.toUTC().toISO()!,
                  endsAtUtc: end?.toUTC().toISO() ?? undefined,
                  uid: current.UID,
                });
              }
            }
          }
        }
      } else if (isMotoGpEvent) {
        const start = parseIcsDateTime(dtstart, current.DTSTART_TZID);
        if (start) {
          const [rawDetails, rawRoundCandidate] = summary.split(/\s+[–-]\s+/);
          const detailPart = rawDetails ?? summary;
          const sessionCode = detailPart.replace(/^MotoGP\s*/i, '').trim();
          const session = normalizeSession(sessionCode);
          if (session) {
            const roundCandidate = rawRoundCandidate?.trim() ?? '';
            const locationParts = extractLocationParts(current.LOCATION);
            const circuit = locationParts[0];
            const country = locationParts.length > 1 ? locationParts.slice(1).join(', ') : undefined;

            const descriptionLines = current.DESCRIPTION
              ? current.DESCRIPTION.split('\\n').map(line => line.trim()).filter(Boolean)
              : [];
            let round = roundCandidate;
            if (!round.length) {
              const fallbackLine =
                descriptionLines.find(line => /grand prix/i.test(line)) ?? descriptionLines[0];
              if (fallbackLine) {
                round = fallbackLine.replace(/^MotoGP\s*/i, '').replace(/^PT\s+/i, '').trim();
              } else {
                round = sanitizeRoundLabel(roundCandidate, circuit, country);
              }
            }

            round = sanitizeRoundLabel(round, circuit, country);
            const series: SeriesId = 'MotoGP';
            const end = parseIcsDateTime(current.DTEND, current.DTEND_TZID ?? current.DTSTART_TZID);

            events.push({
              series,
              round,
              country: country && country.length ? country : undefined,
              circuit: circuit && circuit.length ? circuit : undefined,
              session,
              startsAtUtc: start.toUTC().toISO()!,
              endsAtUtc: end?.toUTC().toISO() ?? undefined,
              uid: current.UID,
            });
          }
        }
      } else {
        const [rawEvent, rawSession] = summary.split(' - ');
        if (rawEvent && rawSession && fallbackSeriesId) {
          const session = normalizeSession(rawSession);
          if (session) {
            const eventName = rawEvent.replace(/^RN365\s*/, '').trim();
            const start = parseIcsDateTime(dtstart, current.DTSTART_TZID);
            if (start) {
              const circuit = current.LOCATION
                ?.replace(/\\,/g, ',')
                .replace(/\\\\/g, '\\');
              const end = parseIcsDateTime(current.DTEND, current.DTEND_TZID ?? current.DTSTART_TZID);

              events.push({
                series: fallbackSeriesId,
                round: eventName,
                circuit,
                session,
                startsAtUtc: start.toUTC().toISO()!,
                endsAtUtc: end?.toUTC().toISO() ?? undefined,
                uid: current.UID,
              });
            }
          }
        }
      }

      current = {};
      continue;
    }

    const [key, ...rest] = line.split(':');
    if (!key || rest.length === 0) {
      continue;
    }
    const value = rest.join(':');
    const [baseKey, ...params] = key.split(';');
    const normalizedKey = baseKey.toUpperCase();

    current[normalizedKey] = value;

    for (const param of params) {
      const [paramKey, paramValue] = param.split('=');
      if (paramKey && paramValue) {
        current[`${normalizedKey}_${paramKey.toUpperCase()}`] = paramValue;
      }
    }
  }

  return events.sort((a, b) => a.startsAtUtc.localeCompare(b.startsAtUtc));
}
