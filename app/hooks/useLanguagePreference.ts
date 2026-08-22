'use client';

import { useEffect, useState } from 'react';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_DEFINITIONS,
  isLanguageCode,
  type LanguageCode,
} from '../../lib/language';
import { LANGUAGE_STORAGE_KEY } from '../../lib/preferences';

function detectBrowserLanguage(): LanguageCode {
  const candidate =
    (typeof navigator !== 'undefined' && navigator.languages && navigator.languages[0]) ||
    (typeof navigator !== 'undefined' ? navigator.language : undefined);
  const base = candidate?.split('-')[0]?.toLowerCase();
  if (!base) return DEFAULT_LANGUAGE;
  return isLanguageCode(base) ? base : 'en';
}

export function useLanguagePreference() {
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.error(error);
    }
    setLanguage(stored && isLanguageCode(stored) ? stored : detectBrowserLanguage());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error(error);
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_DEFINITIONS[language].locale;
  }, [language]);

  return [language, setLanguage] as const;
}
