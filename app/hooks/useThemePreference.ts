'use client';

import { useCallback, useEffect, useState } from 'react';

import { isTheme, SYSTEM_THEME_QUERY, THEME_STORAGE_KEY, type Theme } from '../../lib/theme';

export function useThemePreference() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isInitialized, setInitialized] = useState(false);

  const applyThemeToDocument = useCallback((next: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(SYSTEM_THEME_QUERY);
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    let initial: Theme = 'dark';
    let hasStoredPreference = false;

    if (isTheme(stored)) {
      initial = stored;
      hasStoredPreference = true;
    } else if (media.matches) {
      initial = 'light';
    }

    applyThemeToDocument(initial);
    setTheme(initial);
    setInitialized(true);

    if (hasStoredPreference) {
      return;
    }

    const handleMediaChange = (event: MediaQueryListEvent) => {
      const currentPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(currentPreference)) {
        return;
      }
      setTheme(event.matches ? 'light' : 'dark');
    };

    media.addEventListener('change', handleMediaChange);
    return () => {
      media.removeEventListener('change', handleMediaChange);
    };
  }, [applyThemeToDocument]);

  useEffect(() => {
    if (!isInitialized) return;
    applyThemeToDocument(theme);
  }, [applyThemeToDocument, isInitialized, theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      if (isTheme(event.newValue)) {
        setTheme(event.newValue);
      } else if (event.newValue === null) {
        const prefersLight = window.matchMedia(SYSTEM_THEME_QUERY).matches;
        setTheme(prefersLight ? 'light' : 'dark');
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
