import type { LanguageCode, LanguageDefinition } from './types';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ru } from './ru';
import { zh } from './zh';

export type { FooterCopy, LanguageCode, LanguageDefinition, RaceSession, TranslationBundle } from './types';

export const LANGUAGE_DEFINITIONS: Record<LanguageCode, LanguageDefinition> = {
  ru,
  en,
  es,
  fr,
  de,
  zh,
};

export const LANGUAGE_CODES = Object.keys(LANGUAGE_DEFINITIONS) as LanguageCode[];
export const DEFAULT_LANGUAGE: LanguageCode = 'ru';

export function isLanguageCode(value: string): value is LanguageCode {
  return Object.prototype.hasOwnProperty.call(LANGUAGE_DEFINITIONS, value);
}
