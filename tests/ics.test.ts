import { describe, expect, it } from 'vitest';

import { parseSchedule } from '../lib/ics';

function icsWith(...veventLines: string[]) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', ...veventLines, 'END:VCALENDAR'].join('\n');
}

describe('parseSchedule', () => {
  it('parses pipe-delimited summaries into structured events', () => {
    const events = parseSchedule(
      icsWith(
        'BEGIN:VEVENT',
        'UID:f1-bahrain-race',
        'DTSTART:20260307T150000Z',
        'DTEND:20260307T170000Z',
        'SUMMARY:F1 | Bahrain Grand Prix | Bahrain | Sakhir | Race',
        'END:VEVENT',
      ),
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      series: 'F1',
      round: 'Bahrain Grand Prix',
      country: 'Bahrain',
      circuit: 'Sakhir',
      session: 'Race',
      startsAtUtc: '2026-03-07T15:00:00.000Z',
      endsAtUtc: '2026-03-07T17:00:00.000Z',
    });
  });

  it('unfolds RFC 5545 continuation lines without losing data', () => {
    const events = parseSchedule(
      icsWith(
        'BEGIN:VEVENT',
        'DTSTART:20260307T150000Z',
        // Line folded after the content space; the leading space of the next
        // line is the fold marker and must be dropped.
        'SUMMARY:F1 | Bahrain Grand ',
        ' Prix | Bahrain | Sakhir | Race',
        'END:VEVENT',
      ),
    );

    expect(events).toHaveLength(1);
    expect(events[0].round).toBe('Bahrain Grand Prix');
  });

  it('drops events without a parsable session or start time', () => {
    const events = parseSchedule(
      icsWith(
        'BEGIN:VEVENT',
        'DTSTART:not-a-date',
        'SUMMARY:F1 | Bahrain Grand Prix | Bahrain | Sakhir | Race',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'DTSTART:20260307T150000Z',
        'SUMMARY:F1 | Bahrain Grand Prix | Bahrain | Sakhir | Press conference',
        'END:VEVENT',
      ),
    );

    expect(events).toHaveLength(0);
  });
});
