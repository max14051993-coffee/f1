import { describe, expect, it } from 'vitest';
import { DateTime } from 'luxon';

import { buildRelativeLabel } from '../lib/relative-time';

describe('buildRelativeLabel', () => {
  it('formats upcoming events within two hours as hh:mm', () => {
    const base = DateTime.fromISO('2024-06-01T10:00:00Z');
    const target = base.plus({ hours: 1, minutes: 5, seconds: 20 });

    expect(buildRelativeLabel(target, base, 'en')).toBe('01:05');
  });

  it('uses relative hours for events farther in the future', () => {
    const base = DateTime.fromISO('2024-06-01T10:00:00Z');
    const target = base.plus({ hours: 3 });

    expect(buildRelativeLabel(target, base, 'en')).toBe('in 3 hours');
  });

  it('keeps relative minutes for recent past events', () => {
    const base = DateTime.fromISO('2024-06-01T10:00:00Z');
    const target = base.minus({ minutes: 90 });

    expect(buildRelativeLabel(target, base, 'en')).toBe('90 minutes ago');
  });
});
