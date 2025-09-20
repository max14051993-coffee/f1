import { DateTime } from 'luxon';

export function buildRelativeLabel(target: DateTime, base: DateTime, locale: string) {
  if (!target.isValid || !base.isValid) return null;

  const diffInSeconds = target.diff(base, 'seconds').seconds;
  if (diffInSeconds > 0 && diffInSeconds < 2 * 60 * 60) {
    const totalSeconds = Math.floor(diffInSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const diffInHours = Math.abs(diffInSeconds) / 3600;
  const options = { base, locale, style: 'long' } as const;

  if (diffInHours < 2) {
    return target.toRelative({ ...options, unit: 'minutes' });
  }

  if (diffInHours < 48) {
    return target.toRelative({ ...options, unit: 'hours' });
  }

  return target.toRelative(options);
}
