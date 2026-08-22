import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseSchedule } from '../lib/ics';
import { collectEvents, renderIcs } from '../scripts/update-schedule.mjs';

const fixtureDbs = {
  'https://db.test/f1/2026.json': {
    races: [
      {
        name: 'Australian',
        location: 'Melbourne',
        sessions: {
          fp1: '2026-03-06T01:30:00Z',
          qualifying: '2026-03-07T05:00:00Z',
          sprintQualifying: '2026-03-13T07:30:00Z',
          sprint: '2026-03-14T03:00:00Z',
          gp: '2026-03-08T04:00:00Z',
        },
      },
    ],
  },
  'https://db.test/f2/2026.json': {
    races: [
      {
        name: 'Australian',
        location: 'Melbourne',
        sessions: {
          practice: '2026-03-05T23:00:00Z',
          qualifying: '2026-03-06T03:55:00Z',
          sprint: '2026-03-07T03:30:00Z',
          feature: '2026-03-08T00:25:00Z',
        },
      },
    ],
  },
  'https://db.test/f3/2027.json': { races: [] },
  'https://db.test/motogp/2026.json': {
    races: [
      {
        name: 'Thailand',
        location: 'Thailand',
        track: 'Chang International Circuit',
        sessions: {
          fp1: '2026-02-27T03:45:00Z',
          warmup: '2026-03-01T03:40:00Z',
          qualifying1: '2026-02-28T03:50:00Z',
          qualifying2: '2026-02-28T04:15:00Z',
          sprint: '2026-02-28T08:00:00Z',
          race: '2026-03-01T08:00:00Z',
        },
      },
    ],
  },
  'https://db.test/motogp/2027.json': null,
};

/** Mirrors the script's fetchJson contract: parsed database or null when absent. */
function stubFetcher(url: string) {
  return Promise.resolve((fixtureDbs as Record<string, unknown>)[url] ?? null);
}

describe('collectEvents', () => {
  const events = () =>
    collectEvents({ currentYear: 2026, dataUrl: 'https://db.test', fetchJson: url => stubFetcher(url) });

  it('maps sessions to the site vocabulary and drops unsupported ones', async () => {
    const result = await events();

    const sessionsOf = (series: string) =>
      result.filter(event => event.series === series).map(event => event.session);
    expect(sessionsOf('F1').sort()).toEqual(['Qualifying', 'Qualifying', 'Race', 'Sprint']);
    expect(sessionsOf('F2')).toEqual(['Qualifying', 'Sprint', 'Race']);
    expect(sessionsOf('MotoGP')).toEqual(['Qualifying', 'Qualifying', 'Sprint', 'Race']);
  });

  it('derives country names and keeps venue info for layout matching', async () => {
    const result = await events();
    const f1 = result.find(event => event.series === 'F1')!;
    const motogp = result.find(event => event.series === 'MotoGP')!;

    expect(f1.round).toBe('Australian Grand Prix');
    expect(f1.country).toBe('Australia');
    expect(f1.circuit).toBe('Melbourne');
    expect(motogp.circuit).toBe('Chang International Circuit');
  });

  it('assigns stable uids and deterministic ends', async () => {
    const [firstRun, secondRun] = await Promise.all([events(), events()]);

    expect(firstRun).toEqual(secondRun);
    for (const event of firstRun) {
      expect(event.uid).toMatch(/^racesync-[0-9a-f]{16}@racesync\.app$/);
      const start = new Date(event.startsAtUtc).getTime();
      const end = new Date(event.endsAtUtc).getTime();
      expect(end - start).toBeGreaterThan(0);
    }
  });

  it('sorts events chronologically across series', async () => {
    const result = await events();
    const starts = result.map(event => event.startsAtUtc);
    expect(starts).toEqual([...starts].sort());
  });
});

describe('renderIcs', () => {
  const sample = [
    {
      uid: 'racesync-x@racesync.app',
      series: 'F1',
      round: 'Australian Grand Prix',
      country: 'Australia',
      circuit: 'Melbourne',
      session: 'Race',
      startsAtUtc: '2026-03-08T04:00:00Z',
      endsAtUtc: '2026-03-08T06:00:00Z',
    },
  ];

  it('renders a stable RFC-ready document with pipe summaries', () => {
    const ics = renderIcs(sample);

    expect(ics.split('\r\n')).toContain('SUMMARY:F1 | Australian Grand Prix | Australia | Melbourne | Race');
    expect(ics.split('\r\n')).toContain('LOCATION:Melbourne\\, Australia');
    expect(ics.match(/DTSTAMP:(\d{8}T\d{6}Z)/)?.[0]).toBeTruthy();
  });

  it('is byte-stable for identical input', () => {
    expect(renderIcs(sample)).toBe(renderIcs([...sample]));
  });
});

describe('generated schedule file', () => {
  const ics = readFileSync(path.join(process.cwd(), 'public', 'schedule.ics'), 'utf8');

  it('parses losslessly through the site parser', () => {
    const summaryCount = ics.match(/^SUMMARY:/gm)?.length ?? 0;
    const parsed = parseSchedule(ics);

    expect(summaryCount).toBeGreaterThan(50);
    expect(parsed).toHaveLength(summaryCount);
    for (const event of parsed) {
      expect(['F1', 'F2', 'F3', 'MotoGP']).toContain(event.series);
      expect(['Qualifying', 'Race', 'Sprint']).toContain(event.session);
      expect(event.endsAtUtc).toBeTruthy();
    }
  });

  it('covers every supported series', () => {
    const series = new Set(parseSchedule(ics).map(event => event.series));
    expect(series).toEqual(new Set(['F1', 'F2', 'F3', 'MotoGP']));
  });
});
