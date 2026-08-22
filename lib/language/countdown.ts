const CLOCK_RELATIVE_PATTERN = /^\d{1,2}:\d{2}(?::\d{2})?$/;

export function formatCountdownStart(relative: string, prefix: string, clockPrefix: string) {
  const trimmed = relative.trim();
  if (!trimmed) return prefix;
  const leading = CLOCK_RELATIVE_PATTERN.test(trimmed) ? clockPrefix : prefix;
  return `${leading} ${trimmed}`;
}
