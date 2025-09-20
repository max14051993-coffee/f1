export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'schedule-theme';
export const SYSTEM_THEME_QUERY = '(prefers-color-scheme: light)';

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}
