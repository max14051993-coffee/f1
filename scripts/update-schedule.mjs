/**
 * Regenerates public/schedule.ics from the sportstimes/f1 open-data calendars
 * (MIT-licensed, https://github.com/sportstimes/f1 — the data behind f1calendar.com).
 *
 * The output is a deterministic canonical ICS in the pipe format the site parser
 * expects: "SERIES | Round | Country | Circuit | Session". Running this twice on
 * identical source data produces byte-identical output, so git diffs only appear
 * when the upstream schedules actually change.
 *
 * Usage: node scripts/update-schedule.mjs [--check]
 *   --check  exit with code 1 if the file would change, without writing it.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const DATA_URL = 'https://raw.githubusercontent.com/sportstimes/f1/main/_db';
const OUTPUT_PATH = path.resolve('public/schedule.ics');

const SERIES_ORDER = ['F1', 'F2', 'F3', 'MotoGP'];

/** Session keys in the source JSON mapped to the site's RaceSession union. */
const SESSION_MAP = {
  F1: {
    qualifying: ['Qualifying', 60],
    sprintQualifying: ['Qualifying', 60],
    sprint: ['Sprint', 60],
    gp: ['Race', 120],
  },
  F2: {
    practice: null,
    qualifying: ['Qualifying', 45],
    sprint: ['Sprint', 45],
    feature: ['Race', 60],
  },
  F3: {
    practice: null,
    qualifying: ['Qualifying', 30],
    sprint: ['Sprint', 30],
    feature: ['Race', 45],
  },
  MotoGP: {
    fp1: null,
    fp2: null,
    practice: null,
    warmup: null,
    qualifying1: ['Qualifying', 15],
    qualifying2: ['Qualifying', 15],
    sprint: ['Sprint', 25],
    race: ['Race', 60],
  },
};

/** Source names are adjectives ("Australian"); display works better with countries. */
const COUNTRY_BY_NAME = {
  Australian: 'Australia',
  Austrian: 'Austria',
  Azerbaijan: 'Azerbaijan',
  Bahrain: 'Bahrain',
  Belgian: 'Belgium',
  Brazilian: 'Brazil',
  British: 'Great Britain',
  Canadian: 'Canada',
  Chinese: 'China',
  Dutch: 'Netherlands',
  Hungarian: 'Hungary',
  Italian: 'Italy',
  Japanese: 'Japan',
  Mexican: 'Mexico',
  Miami: 'United States',
  'Las Vegas': 'United States',
  Monaco: 'Monaco',
  Qatar: 'Qatar',
  Saudi: 'Saudi Arabia',
  Singapore: 'Singapore',
  Spanish: 'Spain',
  USA: 'United States',
  'Emilia Romagna': 'Italy',
  Imola: 'Italy',
};

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'RaceSync schedule bot' } });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

function toCountry(name, location) {
  return COUNTRY_BY_NAME[name] ?? (name === location ? name : `${location}`);
}

function roundTitle(series, name) {
  return series === 'F1' && !/grand prix$/i.test(name) ? `${name} Grand Prix` : name;
}

function collectSeriesEvents(series, year, db) {
  const sessionMap = SESSION_MAP[series];
  const events = [];

  for (const race of db.races ?? []) {
    for (const [sessionKey, mapping] of Object.entries(sessionMap)) {
      if (!mapping) continue;
      const [sessionLabel, durationMinutes] = mapping;
      const startsAt = race.sessions?.[sessionKey];
      if (!startsAt) continue;

      const start = new Date(startsAt);
      if (Number.isNaN(start.getTime())) {
        throw new Error(`${series} ${year}: invalid date "${startsAt}" for ${race.name}/${sessionKey}`);
      }
      const end = new Date(start.getTime() + durationMinutes * 60_000);

      const round = roundTitle(series, race.name);
      const country = toCountry(race.name, race.location ?? '');
      // sportstimes stores the host city in `location` for single-seater series and the
      // venue name in `track`; both feed the site's track-layout alias matching.
      const circuit = race.track ?? race.location ?? '';

      events.push({
        uid: `racesync-${createHash('sha1')
          .update([series, round, sessionKey, start.toISOString()].join('|'))
          .digest('hex')
          .slice(0, 16)}@racesync.app`,
        series,
        round,
        country,
        circuit,
        session: sessionLabel,
        startsAtUtc: start.toISOString().replace(/\.\d{3}Z$/, 'Z'),
        endsAtUtc: end.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      });
    }
  }

  return events;
}

export async function collectEvents({
  currentYear = new Date().getUTCFullYear(),
  dataUrl = DATA_URL,
  fetchJson: fetcher = fetchJson,
} = {}) {
  const all = [];
  const years = [currentYear, currentYear + 1];

  for (const series of SERIES_ORDER) {
    for (const year of years) {
      const db = await fetcher(`${dataUrl}/${series.toLowerCase()}/${year}.json`);
      if (!db?.races) continue;
      all.push(...collectSeriesEvents(series, year, db));
    }
  }

  const seen = new Set();
  const unique = all.filter(event => {
    const key = `${event.series}|${event.round}|${event.session}|${event.startsAtUtc}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort(
    (a, b) =>
      a.startsAtUtc.localeCompare(b.startsAtUtc) ||
      SERIES_ORDER.indexOf(a.series) - SERIES_ORDER.indexOf(b.series),
  );

  if (unique.length === 0) {
    throw new Error('No events collected from any source');
  }

  return unique;
}

function escapeIcsValue(value) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** SUMMARY components are consumed by lib/ics.ts which does not unescape, so strip separators instead. */
function cleanSummaryPart(value) {
  return value.replace(/[|\n\r]+/g, '/').trim();
}

function formatIcsDate(iso) {
  return iso.replace(/\.\d+/, '').replace(/[-:]/g, '').replace(/Z$/, '') + 'Z';
}

/**
 * DTSTAMP must change only when the schedule itself changes, otherwise every run would
 * rewrite the file. Deriving it from the newest event keeps identical datasets byte-equal.
 */
function feedStamp(events) {
  const lastEnd = events.reduce(
    (max, event) => (event.endsAtUtc > max ? event.endsAtUtc : max),
    events[0]?.endsAtUtc ?? '1970-01-01T00:00:00Z',
  );
  return formatIcsDate(lastEnd);
}

export function renderIcs(events) {
  const dtstamp = feedStamp(events);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RaceSync//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:RaceSync Schedule',
  ];

  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${formatIcsDate(event.startsAtUtc)}`,
      `DTEND:${formatIcsDate(event.endsAtUtc)}`,
      `SUMMARY:${[event.series, event.round, event.country, event.circuit, event.session]
        .map(cleanSummaryPart)
        .join(' | ')}`,
      `LOCATION:${escapeIcsValue([event.circuit, event.country].filter(Boolean).join(', '))}`,
      `DESCRIPTION:${escapeIcsValue(`${event.series} - ${event.session}`)}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  // LF keeps diffs minimal across OSes (.gitattributes pins eol=lf for *.ics);
  // the site parser accepts both separators.
  return lines.join('\n') + '\n';
}

function argsIncludeCheck(argv) {
  return argv.includes('--check');
}

async function main() {
  const events = await collectEvents();
  const ics = renderIcs(events);

  let current = '';
  try {
    current = await readFile(OUTPUT_PATH, 'utf8');
  } catch {
    // First run — file will be created.
  }

  if (current === ics) {
    console.log(`schedule.ics is up to date (${events.length} events)`);
    return;
  }

  if (argsIncludeCheck(process.argv)) {
    console.log(`schedule.ics would change (${events.length} events)`);
    process.exitCode = 1;
    return;
  }

  await writeFile(OUTPUT_PATH, ics, 'utf8');
  console.log(`Wrote ${OUTPUT_PATH} (${events.length} events)`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
