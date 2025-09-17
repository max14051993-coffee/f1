'use client';

import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { getTrackLayout } from '../lib/track-layouts';

type SeriesDefinition = {
  label: string;
  accentColor: string;
  accentRgb: string;
  logoBackground: string;
  logoAsset?: string;
};

const ASSET_PREFIX = (process.env.NEXT_PUBLIC_ASSET_PREFIX ?? '').replace(/\/$/, '');

function prefixAssetPath(asset?: string) {
  if (!asset) return undefined;
  if (asset.startsWith('http://') || asset.startsWith('https://')) return asset;
  if (!ASSET_PREFIX) return asset;
  if (asset.startsWith('/')) return `${ASSET_PREFIX}${asset}`;
  return `${ASSET_PREFIX}/${asset}`;
}

const SERIES_DEFINITIONS = {
  F1: {
    label: 'F1',
    accentColor: '#e10600',
    accentRgb: '225, 6, 0',
    logoBackground: '#111',
    logoAsset: '/logos/f1.svg',
  },
  F2: {
    label: 'F2',
    accentColor: '#0090ff',
    accentRgb: '0, 144, 255',
    logoBackground: '#fff',
    logoAsset: '/logos/f2.svg',
  },
  F3: {
    label: 'F3',
    accentColor: '#ff6f00',
    accentRgb: '255, 111, 0',
    logoBackground: '#fff',
    logoAsset: '/logos/f3.svg',
  },
  MotoGP: {
    label: 'MotoGP',
    accentColor: '#ff0050',
    accentRgb: '255, 0, 80',
    logoBackground: '#fff',
    logoAsset: '/logos/motogp.svg',
  },
} as const satisfies Record<string, SeriesDefinition>;

type SeriesId = keyof typeof SERIES_DEFINITIONS;

const SERIES_IDS = Object.keys(SERIES_DEFINITIONS) as SeriesId[];

const DEFAULT_SERIES_ID = SERIES_IDS[0];

const FALLBACK_SERIES_DEFINITION =
  DEFAULT_SERIES_ID ? SERIES_DEFINITIONS[DEFAULT_SERIES_ID] : undefined;

function isSeriesId(value: string): value is SeriesId {
  return Object.prototype.hasOwnProperty.call(SERIES_DEFINITIONS, value);
}

function buildSeriesVisibility(value: boolean): Record<SeriesId, boolean> {
  return SERIES_IDS.reduce((acc, series) => {
    acc[series] = value;
    return acc;
  }, {} as Record<SeriesId, boolean>);
}

type Row = {
  series: SeriesId;
  round: string;
  country?: string;
  circuit?: string;
  session: 'Qualifying' | 'Race' | 'Sprint';
  startsAtUtc: string; // ISO
};

type LanguageCode = 'en' | 'ru' | 'es' | 'fr' | 'de';

type TranslationBundle = {
  heroBadge: string;
  heroTitle: (seriesTitle: string) => string;
  heroSubtitle: string;
  seriesLabel: string;
  activeSelection: (names: string[]) => string;
  allSeriesHidden: string;
  reviewPeriodLabel: string;
  eventsInWindowLabel: string;
  nextStartLabel: string;
  noEvents: string;
  extendPeriodHint: string;
  countdownStart: (relative: string) => string;
  countdownFinish: (relative: string) => string;
  countdownScheduled: string;
  trackLayoutLabel: (parts: string[]) => string;
  languageLabel: string;
  seriesLogoAria: (series: string) => string;
  upcomingEventDescriptorFallback: string;
};

type LanguageDefinition = {
  code: LanguageCode;
  name: string;
  locale: string;
  periodOptions: { label: string; value?: number }[];
  sessionLabels: Record<Row['session'], string>;
  texts: TranslationBundle;
};

const LANGUAGE_DEFINITIONS: Record<LanguageCode, LanguageDefinition> = {
  ru: {
    code: 'ru',
    name: 'Русский',
    locale: 'ru',
    periodOptions: [
      { label: '24 часа', value: 24 },
      { label: '48 часов', value: 48 },
      { label: '72 часа', value: 72 },
      { label: '7 дней', value: 168 },
      { label: '30 дней' },
    ],
    sessionLabels: {
      Qualifying: 'Квалификация',
      Race: 'Гонка',
      Sprint: 'Спринт',
    },
    texts: {
      heroBadge: 'живой календарь уик-эндов',
      heroTitle: seriesTitle =>
        `Ближайшие квалификации и гонки — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Синхронизируйтесь с динамикой гоночных уик-эндов: фильтруйте серии, управляйте горизонтом просмотра и следите за временем старта в собственном часовом поясе.',
      seriesLabel: 'Серии',
      activeSelection: names => `Выбрано: ${names.join(' · ')}`,
      allSeriesHidden: 'Все серии скрыты',
      reviewPeriodLabel: 'Период обзора',
      eventsInWindowLabel: 'Событий в окне',
      nextStartLabel: 'Ближайший старт',
      noEvents: 'Нет событий',
      extendPeriodHint: 'Попробуйте расширить период',
      countdownStart: relative => `Старт ${relative}`,
      countdownFinish: relative => `Финиш ${relative}`,
      countdownScheduled: 'По расписанию',
      trackLayoutLabel: parts =>
        parts.length ? `Схема автодрома: ${parts.join(' — ')}` : 'Схема автодрома',
      languageLabel: 'Язык',
      seriesLogoAria: series => `Логотип ${series}`,
      upcomingEventDescriptorFallback: 'Нет событий',
    },
  },
  en: {
    code: 'en',
    name: 'English',
    locale: 'en',
    periodOptions: [
      { label: '24 hours', value: 24 },
      { label: '48 hours', value: 48 },
      { label: '72 hours', value: 72 },
      { label: '7 days', value: 168 },
      { label: '30 days' },
    ],
    sessionLabels: {
      Qualifying: 'Qualifying',
      Race: 'Race',
      Sprint: 'Sprint',
    },
    texts: {
      heroBadge: 'live weekend calendar',
      heroTitle: seriesTitle =>
        `Upcoming qualifying & races — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Stay in sync with race weekends: filter the series, adjust the viewing window, and track session times in your own timezone.',
      seriesLabel: 'Series',
      activeSelection: names => `Selected: ${names.join(' · ')}`,
      allSeriesHidden: 'All series hidden',
      reviewPeriodLabel: 'Viewing window',
      eventsInWindowLabel: 'Events in window',
      nextStartLabel: 'Next session',
      noEvents: 'No events',
      extendPeriodHint: 'Try expanding the window',
      countdownStart: relative => `Starts ${relative}`,
      countdownFinish: relative => `Finished ${relative}`,
      countdownScheduled: 'On schedule',
      trackLayoutLabel: parts =>
        parts.length ? `Circuit layout: ${parts.join(' — ')}` : 'Circuit layout',
      languageLabel: 'Language',
      seriesLogoAria: series => `${series} logo`,
      upcomingEventDescriptorFallback: 'No events',
    },
  },
  es: {
    code: 'es',
    name: 'Español',
    locale: 'es',
    periodOptions: [
      { label: '24 horas', value: 24 },
      { label: '48 horas', value: 48 },
      { label: '72 horas', value: 72 },
      { label: '7 días', value: 168 },
      { label: '30 días' },
    ],
    sessionLabels: {
      Qualifying: 'Clasificación',
      Race: 'Carrera',
      Sprint: 'Sprint',
    },
    texts: {
      heroBadge: 'calendario de fines de semana en vivo',
      heroTitle: seriesTitle =>
        `Próximas clasificaciones y carreras — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Mantente sincronizado con los fines de semana de carreras: filtra las series, ajusta la ventana de visualización y sigue los horarios de las sesiones en tu propio huso horario.',
      seriesLabel: 'Series',
      activeSelection: names => `Seleccionadas: ${names.join(' · ')}`,
      allSeriesHidden: 'Todas las series ocultas',
      reviewPeriodLabel: 'Ventana de visualización',
      eventsInWindowLabel: 'Eventos en la ventana',
      nextStartLabel: 'Próxima sesión',
      noEvents: 'Sin eventos',
      extendPeriodHint: 'Intenta ampliar la ventana',
      countdownStart: relative => `Comienza ${relative}`,
      countdownFinish: relative => `Terminó ${relative}`,
      countdownScheduled: 'Según lo previsto',
      trackLayoutLabel: parts =>
        parts.length ? `Trazado del circuito: ${parts.join(' — ')}` : 'Trazado del circuito',
      languageLabel: 'Idioma',
      seriesLogoAria: series => `Logotipo de ${series}`,
      upcomingEventDescriptorFallback: 'Sin eventos',
    },
  },
  fr: {
    code: 'fr',
    name: 'Français',
    locale: 'fr',
    periodOptions: [
      { label: '24 heures', value: 24 },
      { label: '48 heures', value: 48 },
      { label: '72 heures', value: 72 },
      { label: '7 jours', value: 168 },
      { label: '30 jours' },
    ],
    sessionLabels: {
      Qualifying: 'Qualifications',
      Race: 'Course',
      Sprint: 'Sprint',
    },
    texts: {
      heroBadge: 'calendrier des week-ends en direct',
      heroTitle: seriesTitle =>
        `Prochaines qualifications et courses — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Restez synchronisé avec les week-ends de course : filtrez les séries, ajustez la fenêtre d’affichage et suivez les horaires des sessions dans votre propre fuseau horaire.',
      seriesLabel: 'Séries',
      activeSelection: names => `Sélection : ${names.join(' · ')}`,
      allSeriesHidden: 'Toutes les séries masquées',
      reviewPeriodLabel: 'Fenêtre d’affichage',
      eventsInWindowLabel: 'Événements dans la fenêtre',
      nextStartLabel: 'Prochaine session',
      noEvents: 'Aucun événement',
      extendPeriodHint: 'Essayez d’élargir la fenêtre',
      countdownStart: relative => `Commence ${relative}`,
      countdownFinish: relative => `Terminé ${relative}`,
      countdownScheduled: 'Selon le programme',
      trackLayoutLabel: parts =>
        parts.length ? `Tracé du circuit : ${parts.join(' — ')}` : 'Tracé du circuit',
      languageLabel: 'Langue',
      seriesLogoAria: series => `Logo ${series}`,
      upcomingEventDescriptorFallback: 'Aucun événement',
    },
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    locale: 'de',
    periodOptions: [
      { label: '24 Stunden', value: 24 },
      { label: '48 Stunden', value: 48 },
      { label: '72 Stunden', value: 72 },
      { label: '7 Tage', value: 168 },
      { label: '30 Tage' },
    ],
    sessionLabels: {
      Qualifying: 'Qualifying',
      Race: 'Rennen',
      Sprint: 'Sprint',
    },
    texts: {
      heroBadge: 'Live-Wochenendkalender',
      heroTitle: seriesTitle =>
        `Bevorstehende Qualifyings & Rennen — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Bleib mit den Rennwochenenden im Takt: Filtere die Serien, passe das Betrachtungsfenster an und verfolge die Sessionzeiten in deiner eigenen Zeitzone.',
      seriesLabel: 'Serien',
      activeSelection: names => `Ausgewählt: ${names.join(' · ')}`,
      allSeriesHidden: 'Alle Serien ausgeblendet',
      reviewPeriodLabel: 'Betrachtungszeitraum',
      eventsInWindowLabel: 'Events im Zeitraum',
      nextStartLabel: 'Nächste Session',
      noEvents: 'Keine Events',
      extendPeriodHint: 'Versuche den Zeitraum zu vergrößern',
      countdownStart: relative => `Beginnt ${relative}`,
      countdownFinish: relative => `Beendet ${relative}`,
      countdownScheduled: 'Planmäßig',
      trackLayoutLabel: parts =>
        parts.length ? `Streckenlayout: ${parts.join(' — ')}` : 'Streckenlayout',
      languageLabel: 'Sprache',
      seriesLogoAria: series => `${series}-Logo`,
      upcomingEventDescriptorFallback: 'Keine Events',
    },
  },
} as const;

const LANGUAGE_CODES = Object.keys(LANGUAGE_DEFINITIONS) as LanguageCode[];
const DEFAULT_LANGUAGE: LanguageCode = 'ru';
const LANGUAGE_STORAGE_KEY = 'schedule-language';

function isLanguageCode(value: string): value is LanguageCode {
  return Object.prototype.hasOwnProperty.call(LANGUAGE_DEFINITIONS, value);
}

function normalizeSession(raw: string): Row['session'] | undefined {
  const trimmed = raw.trim();
  if (!trimmed.length) return undefined;

  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  if (lower.includes('sprint') || upper === 'SPR') {
    if (lower.includes('qual')) return 'Qualifying';
    return 'Sprint';
  }
  if (lower.includes('qual') || /^Q\d+$/.test(upper)) return 'Qualifying';
  if (lower.includes('feature')) return 'Race';
  if (lower.includes('race') || upper === 'RAC' || lower === 'grand prix' || upper === 'GP') return 'Race';
  return undefined;
}

function parseICS(ics: string): Row[] {
  const lines = ics.split(/\r?\n/);
  const events: Row[] = [];
  let current: Record<string, string> = {};
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
    } else if (line === 'END:VEVENT') {
      const summary = current.SUMMARY;
      const dtstart = current.DTSTART;
      if (summary && dtstart) {
        const categories = current.CATEGORIES
          ? current.CATEGORIES.split(',').map(part => part.trim()).filter(Boolean)
          : [];
        const isMotoGpEvent =
          categories.some(cat => cat.toLowerCase() === 'motogp') || /^MotoGP\b/i.test(summary);

        if (summary.includes('|')) {
          const parts = summary.split('|').map(part => part.trim());
          if (parts.length >= 5) {
            const [seriesRaw, roundRaw, countryRaw, circuitRaw, sessionRaw] = parts;
            if (!isSeriesId(seriesRaw)) continue;

            let dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss'Z'", { zone: 'utc' });
            if (!dt.isValid) {
              const tz = current.DTSTART_TZID || 'utc';
              dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss", { zone: tz });
            }
            if (dt.isValid) {
              const session = normalizeSession(sessionRaw);
              if (!session) continue;

              const round = roundRaw.trim();
              const country = countryRaw.trim();
              const circuit = circuitRaw.trim();

              events.push({
                series: seriesRaw,
                round,
                country: country.length ? country : undefined,
                circuit: circuit.length ? circuit : undefined,
                session,
                startsAtUtc: dt.toUTC().toISO()!,
              });
            }
          }
        } else if (isMotoGpEvent) {
          let dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss'Z'", { zone: 'utc' });
          if (!dt.isValid) {
            const tz = current.DTSTART_TZID || 'utc';
            dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss", { zone: tz });
          }
          if (dt.isValid) {
            const [rawDetails, rawRoundCandidate] = summary.split(/\s+[–-]\s+/);
            const detailPart = rawDetails ?? summary;
            const sessionCode = detailPart.replace(/^MotoGP\s*/i, '').trim();
            const session = normalizeSession(sessionCode);
            if (!session) continue;

            const roundCandidate = rawRoundCandidate?.trim() ?? '';
            const location = current.LOCATION
              ?.replace(/\\,/g, ',')
              .replace(/\\\\/g, '\\');
            const locationParts = location
              ? location.split(',').map(part => part.trim()).filter(Boolean)
              : [];
            const circuit = locationParts[0];
            const country = locationParts.length > 1 ? locationParts.slice(1).join(', ') : undefined;

            const descriptionLines = current.DESCRIPTION
              ? current.DESCRIPTION.split('\\n').map(line => line.trim()).filter(Boolean)
              : [];
            let round = roundCandidate;
            if (!round.length) {
              const fallbackLine =
                descriptionLines.find(line => /grand prix/i.test(line)) ?? descriptionLines[0];
              if (fallbackLine) {
                round = fallbackLine
                  .replace(/^MotoGP\s*/i, '')
                  .replace(/^PT\s+/i, '')
                  .trim();
              } else if (country) {
                round = `${country} MotoGP`;
              } else if (circuit) {
                round = circuit;
              } else {
                round = 'MotoGP';
              }
            }
            round = round.replace(/\s+/g, ' ').trim();
            if (!round.length) round = 'MotoGP';

            const series: SeriesId = 'MotoGP';

            events.push({
              series,
              round,
              country: country && country.length ? country : undefined,
              circuit: circuit && circuit.length ? circuit : undefined,
              session,
              startsAtUtc: dt.toUTC().toISO()!,
            });
          }
        } else {
          const [rawEvent, rawSession] = summary.split(' - ');
          if (rawEvent && rawSession) {
            const session = normalizeSession(rawSession);
            if (session) {
              const eventName = rawEvent.replace(/^RN365\s*/, '').trim();
              const tz = current.DTSTART_TZID || 'utc';
              const dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss", { zone: tz });
              if (dt.isValid) {
                const circuit = current.LOCATION
                  ?.replace(/\\,/g, ',')
                  .replace(/\\\\/g, '\\');
                const fallbackSeries = DEFAULT_SERIES_ID;
                if (!fallbackSeries) continue;

                events.push({
                  series: fallbackSeries,
                  round: eventName,
                  circuit,
                  session,
                  startsAtUtc: dt.toUTC().toISO()!,
                });
              }
            }
          }
        }
      }
    } else {
      const [rawKey, value] = line.split(':', 2);
      if (!rawKey || !value) continue;
      const [key, ...params] = rawKey.split(';');
      current[key] = value;
      if (key === 'DTSTART') {
        const tzParam = params.find(p => p.startsWith('TZID='));
        if (tzParam) current.DTSTART_TZID = tzParam.split('=')[1];
      }
    }
  }
  return events;
}

function SeriesLogo({ series, ariaLabel }: { series: SeriesId; ariaLabel?: string }) {
  const definition = SERIES_DEFINITIONS[series];
  const { label, logoBackground, logoAsset, accentColor } = definition;
  const resolvedLogoAsset = useMemo(() => prefixAssetPath(logoAsset), [logoAsset]);
  const accessibleLabel = ariaLabel ?? `${label} logo`;

  const defaultText = (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={accentColor}
      fontFamily="var(--font-display, 'Manrope')"
      fontSize={15}
      letterSpacing={1.2}
    >
      {label}
    </text>
  );

  return (
    <svg
      width={56}
      height={24}
      viewBox="0 0 56 24"
      role="img"
      aria-label={accessibleLabel}
      style={{ display: 'block' }}
    >
      <rect x={0} y={0} width={56} height={24} rx={6} fill={logoBackground} />
      {resolvedLogoAsset ? (
        <image
          x={0}
          y={0}
          width={56}
          height={24}
          preserveAspectRatio="xMidYMid meet"
          href={resolvedLogoAsset}
          xlinkHref={resolvedLogoAsset}
        />
      ) : (
        defaultText
      )}
    </svg>
  );
}

const SERIES_TITLE = SERIES_IDS.map(series => SERIES_DEFINITIONS[series].label).join(' / ');

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesId, boolean>>(() =>
    buildSeriesVisibility(true),
  );
  const [hours, setHours] = useState<number | undefined>(undefined);
  const [userTz, setUserTz] = useState<string>('UTC');
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    async function load() {
      const text = await fetch('./schedule.ics').then(r => r.text());
      const events = parseICS(text);
      setRows(events);
    }
    load().catch(console.error);
    setUserTz(DateTime.local().zoneName);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isLanguageCode(stored)) {
      setLanguage(stored);
      return;
    }

    const browserLanguage =
      (typeof navigator !== 'undefined' && navigator.languages && navigator.languages[0]) ||
      (typeof navigator !== 'undefined' ? navigator.language : undefined);
    if (!browserLanguage) return;

    const base = browserLanguage.split('-')[0]?.toLowerCase();
    if (!base) return;

    if (isLanguageCode(base)) {
      setLanguage(base);
    } else {
      setLanguage('en');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const languageDefinition = LANGUAGE_DEFINITIONS[language];
  const { texts, periodOptions, sessionLabels, locale } = languageDefinition;

  const filtered = useMemo(() => {
    let arr = rows.filter(r => visibleSeries[r.series]);
    const now = DateTime.utc();
    const limit = hours && hours > 0 ? hours : 24 * 30; // default 30 days
    const from = now.minus({ hours: 24 });
    const to = now.plus({ hours: limit });
    arr = arr.filter(r => {
      const dt = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' });
      return dt >= from && dt <= to;
    });
    return arr
      .slice()
      .sort((a, b) => Date.parse(a.startsAtUtc) - Date.parse(b.startsAtUtc));
  }, [rows, visibleSeries, hours]);

  const nowLocal = DateTime.local().setZone(userTz).setLocale(locale);
  const timezoneOffset = nowLocal.toFormat('ZZ');
  const timezoneBadgeLabel = userTz?.trim().length
    ? `${userTz} (UTC${timezoneOffset})`
    : `UTC${timezoneOffset}`;
  const activeSeries = (Object.entries(visibleSeries) as [SeriesId, boolean][])
    .filter(([, active]) => active)
    .map(([series]) => series);
  const activeSeriesNames = activeSeries.map(series => SERIES_DEFINITIONS[series].label);
  const hasActiveSeries = activeSeriesNames.length > 0;
  const activeSeriesSelection = hasActiveSeries
    ? texts.activeSelection(activeSeriesNames)
    : texts.allSeriesHidden;
  const selectedPeriodLabel =
    periodOptions.find(opt => opt.value === hours)?.label ?? periodOptions[periodOptions.length - 1]?.label ?? '';
  const nextEvent = filtered[0];
  const nextSeriesDefinition = nextEvent ? SERIES_DEFINITIONS[nextEvent.series] : undefined;
  const nextSeriesLabel = nextSeriesDefinition?.label ?? nextEvent?.series ?? '';
  const nextLocal = nextEvent
    ? DateTime.fromISO(nextEvent.startsAtUtc, { zone: 'utc' })
        .setZone(userTz)
        .setLocale(locale)
    : null;
  const nextRelative = nextLocal
    ? nextLocal.toRelative({ base: nowLocal, locale, style: 'long' })
    : null;
  const nextCountdown =
    nextLocal && nextRelative
      ? nextLocal > nowLocal
        ? texts.countdownStart(nextRelative)
        : texts.countdownFinish(nextRelative)
      : null;
  const nextDescriptor = nextEvent
    ? `${nextEvent.round}${nextEvent.country ? ` • ${nextEvent.country}` : ''}`
    : texts.upcomingEventDescriptorFallback;
  const heroSeriesDefinition = nextSeriesDefinition ?? FALLBACK_SERIES_DEFINITION;
  const heroAccentColor = heroSeriesDefinition?.accentColor ?? '#e10600';
  const heroAccentRgb = heroSeriesDefinition?.accentRgb ?? '225, 6, 0';

  return (
    <main className="page-shell">
      <section
        className="hero"
        style={
          {
            '--hero-accent': heroAccentColor,
            '--hero-accent-rgb': heroAccentRgb,
          } as CSSProperties
        }
      >
        <div className="hero__intro">
          <div className="hero__top-row">
            <div className="hero__badge-wrapper">
              <span className="hero__badge">
                <span className="hero__badge-text">{texts.heroBadge}</span>
                <span className="hero__badge-timezone">{timezoneBadgeLabel}</span>
              </span>
            </div>
            <div className="hero__language">
              <label
                className="hero__language-label control-panel__label"
                htmlFor="language-select"
              >
                {texts.languageLabel}
              </label>
              <div className="language-select">
                <select
                  id="language-select"
                  className="language-select__dropdown"
                  value={language}
                  onChange={event => {
                    const value = event.target.value;
                    if (isLanguageCode(value)) {
                      setLanguage(value);
                    }
                  }}
                >
                  {LANGUAGE_CODES.map(code => (
                    <option key={code} value={code}>
                      {LANGUAGE_DEFINITIONS[code].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <h1 className="hero__title">
            {texts.heroTitle(SERIES_TITLE || 'F1 / F2 / F3 / MotoGP')}
          </h1>
          <p className="hero__subtitle">{texts.heroSubtitle}</p>
        </div>
        <div className="hero__layout">
          <div className="hero__column">
            <div className="hero-card">
              <div className="hero-card__section">
                <div className="hero-card__section-header">
                  <span className="control-panel__label">{texts.seriesLabel}</span>
                  <span
                    className="control-panel__selection"
                    aria-live="polite"
                    data-empty={!hasActiveSeries}
                  >
                    {activeSeriesSelection}
                  </span>
                </div>
                <div className="series-chips">
                  {SERIES_IDS.map(series => {
                    const definition = SERIES_DEFINITIONS[series];
                    return (
                      <label
                        key={series}
                        className="series-chip"
                        data-active={visibleSeries[series]}
                        style={
                          {
                            '--chip-color': definition.accentColor,
                            '--chip-rgb': definition.accentRgb,
                          } as CSSProperties
                        }
                      >
                        <input
                          type="checkbox"
                          checked={visibleSeries[series]}
                          onChange={() =>
                            setVisibleSeries(prev => ({
                              ...prev,
                              [series]: !prev[series],
                            }))
                          }
                        />
                        <span className="series-chip__indicator" aria-hidden />
                        <span>{definition.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="hero-card__section">
                <div className="hero-card__section-header">
                  <span className="control-panel__label">{texts.reviewPeriodLabel}</span>
                </div>
                <div className="period-buttons">
                  {periodOptions.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      className="period-button"
                      data-active={hours === opt.value}
                      onClick={() => setHours(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="hero__event-summary">
                  <span className="hero__event-summary-label">{texts.eventsInWindowLabel}</span>
                  <span className="hero__event-summary-value">{filtered.length}</span>
                  <span className="hero__event-summary-period">{selectedPeriodLabel}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero__column">
            <div className="hero-card hero-card--summary">
              <span className="hero-card__label">{texts.nextStartLabel}</span>
              {nextEvent && nextLocal ? (
                <>
                  <span className="hero-card__value">{nextLocal.toFormat('dd LLL • HH:mm')}</span>
                  <span className="hero-card__meta">{nextSeriesLabel}</span>
                  <span className="hero-card__meta hero-card__meta--muted">{nextDescriptor}</span>
                  {nextCountdown ? (
                    <span className="hero-card__meta hero-card__meta--accent">
                      {nextCountdown}
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="hero-card__value">{texts.noEvents}</span>
                  <span className="hero-card__meta hero-card__meta--muted">
                    {texts.extendPeriodHint}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <ul className="events-grid">
        {filtered.map((r, index) => {
          const definition = SERIES_DEFINITIONS[r.series];
          const accentColor = definition.accentColor;
          const accentRgb = definition.accentRgb;
          const local = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' }).setZone(userTz);
          const localized = local.setLocale(locale);
          const isoLocal = local.toISO();
          const timeLabel = localized.toFormat('HH:mm');
          const dayLabel = localized.toFormat('ccc');
          const dateLabel = localized.toFormat('dd LLL');
          const relative = localized.toRelative({ base: nowLocal, locale, style: 'long' });
          const countdown = relative
            ? localized > nowLocal
              ? texts.countdownStart(relative)
              : texts.countdownFinish(relative)
            : texts.countdownScheduled;
          const track = getTrackLayout(r.circuit, r.round);
          const trackLabelParts = Array.from(
            new Set(
              [r.circuit, r.round].filter(
                (part): part is string => !!part && part.trim().length > 0
              )
            )
          );
          const trackLabel = texts.trackLayoutLabel(trackLabelParts);
          const sessionLabel = sessionLabels[r.session] ?? r.session;

          return (
            <li
              key={`${r.startsAtUtc}-${index}`}
              className="event-card"
              style={
                {
                  '--accent-color': accentColor,
                  '--accent-rgb': accentRgb,
                } as CSSProperties
              }
            >
              <div className="event-card__inner">
                <div className="event-card__top">
                  <div className="event-card__series">
                    <div className="event-card__logo">
                      <SeriesLogo
                        series={r.series}
                        ariaLabel={texts.seriesLogoAria(definition.label)}
                      />
                    </div>
                    <span className="event-card__series-pill">{definition.label}</span>
                  </div>
                  <time className="event-card__datetime" dateTime={isoLocal ?? undefined}>
                    <span className="event-card__time">{timeLabel}</span>
                    <span className="event-card__date">
                      {dayLabel}, {dateLabel}
                    </span>
                  </time>
                </div>
                <div className="event-card__title">
                  <span>{r.round}</span>
                  {r.country ? <span className="event-card__country">{r.country}</span> : null}
                </div>
                <div className="event-card__meta">
                  {r.circuit ? <span>{r.circuit}</span> : null}
                  <span>{sessionLabel}</span>
                </div>
                {track ? (
                  <div className="event-card__track">
                    <svg
                      viewBox={track.layout.viewBox}
                      role="img"
                      aria-label={trackLabel}
                      focusable="false"
                    >
                      <path className="event-card__track-shadow" d={track.layout.path} />
                      <path className="event-card__track-outline" d={track.layout.path} />
                      <path className="event-card__track-highlight" d={track.layout.path} />
                    </svg>
                  </div>
                ) : null}
                <div className="event-card__countdown">
                  <span className="event-card__countdown-dot" aria-hidden />
                  <span>{countdown}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
