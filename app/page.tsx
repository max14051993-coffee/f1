'use client';

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_CODES,
  LANGUAGE_DEFINITIONS,
  type LanguageCode,
  type RaceSession,
  isLanguageCode,
} from '../lib/language';
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
  session: RaceSession;
  startsAtUtc: string; // ISO
};

function buildRelativeLabel(target: DateTime, base: DateTime, locale: string) {
  if (!target.isValid || !base.isValid) return null;

  const diffInHours = Math.abs(target.diff(base, 'hours').hours);
  const options = { base, locale, style: 'long' } as const;

  if (diffInHours < 1) {
    return target.toRelative({ ...options, unit: 'minutes' });
  }

  if (diffInHours < 48) {
    return target.toRelative({ ...options, unit: 'hours' });
  }

  return target.toRelative(options);
}

const LANGUAGE_STORAGE_KEY = 'schedule-language';
const SERIES_STORAGE_KEY = 'schedule-visible-series';
const PERIOD_STORAGE_KEY = 'schedule-review-period-hours';
const THEME_STORAGE_KEY = 'schedule-theme';
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: light)';

type Theme = 'dark' | 'light';

function isTheme(value: string | null): value is Theme {
  return value === 'dark' || value === 'light';
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
  const [theme, setTheme] = useState<Theme>('dark');
  const [themeInitialized, setThemeInitialized] = useState(false);
  const applyThemeToDocument = useCallback((next: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
  }, []);

  const [rows, setRows] = useState<Row[]>([]);
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesId, boolean>>(() =>
    buildSeriesVisibility(true),
  );
  const [hours, setHours] = useState<number | undefined>(undefined);
  const [hasLoadedSeriesFilters, setHasLoadedSeriesFilters] = useState(false);
  const [hasLoadedPeriod, setHasLoadedPeriod] = useState(false);
  const [userTz, setUserTz] = useState<string>('UTC');
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [isPrivacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const languageControlRef = useRef<HTMLDivElement | null>(null);
  const privacyPolicyDialogRef = useRef<HTMLDivElement | null>(null);

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
    setThemeInitialized(true);

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
    if (!themeInitialized) return;
    applyThemeToDocument(theme);
  }, [theme, themeInitialized, applyThemeToDocument]);

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
    if (typeof localStorage === 'undefined') {
      setHasLoadedSeriesFilters(true);
      return;
    }

    const stored = localStorage.getItem(SERIES_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const next = buildSeriesVisibility(true);
          let hasValid = false;
          for (const series of SERIES_IDS) {
            if (typeof parsed[series] === 'boolean') {
              next[series] = parsed[series] as boolean;
              hasValid = true;
            }
          }
          if (hasValid) {
            setVisibleSeries(next);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    setHasLoadedSeriesFilters(true);
  }, []);

  useEffect(() => {
    if (typeof localStorage === 'undefined') {
      setHasLoadedPeriod(true);
      return;
    }

    const stored = localStorage.getItem(PERIOD_STORAGE_KEY);
    if (stored) {
      if (stored === 'all') {
        setHours(undefined);
      } else {
        const parsed = Number.parseInt(stored, 10);
        if (Number.isFinite(parsed)) {
          setHours(parsed);
        }
      }
    }

    setHasLoadedPeriod(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedSeriesFilters || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(SERIES_STORAGE_KEY, JSON.stringify(visibleSeries));
    } catch (error) {
      console.error(error);
    }
  }, [visibleSeries, hasLoadedSeriesFilters]);

  useEffect(() => {
    if (!hasLoadedPeriod || typeof localStorage === 'undefined') {
      return;
    }

    const value = typeof hours === 'number' && Number.isFinite(hours) ? hours.toString(10) : 'all';
    try {
      localStorage.setItem(PERIOD_STORAGE_KEY, value);
    } catch (error) {
      console.error(error);
    }
  }, [hours, hasLoadedPeriod]);

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

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (languageControlRef.current?.contains(event.target as Node)) {
        return;
      }
      setLanguageMenuOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const header = headerRef.current;
    if (!header) {
      return;
    }

    const root = document.documentElement;
    const resizeTarget = document.defaultView as unknown as {
      addEventListener: (type: 'resize', listener: () => void) => void;
      removeEventListener: (type: 'resize', listener: () => void) => void;
    } | null;


    const updateOffset = () => {
      const height = header.getBoundingClientRect().height;
      const offset = Math.ceil(height + 24);
      root.style.setProperty('--site-header-offset', `${offset}px`);
    };

    updateOffset();

    if (typeof ResizeObserver !== 'undefined') {

      const observer = new ResizeObserver(() => {
        updateOffset();
      });
      observer.observe(header);
      return () => {
        observer.disconnect();
      };
    }

    if (!resizeTarget) {
      return;
    }

    resizeTarget.addEventListener('resize', updateOffset);
    return () => {
      resizeTarget.removeEventListener('resize', updateOffset);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (!isPrivacyPolicyOpen) {
      return;
    }

    const previousActive = document.activeElement as HTMLElement | null;
    const dialog = privacyPolicyDialogRef.current;
    dialog?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPrivacyPolicyOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActive?.focus?.();
    };
  }, [isPrivacyPolicyOpen]);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLanguageMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLanguageMenuOpen]);

  const languageDefinition = LANGUAGE_DEFINITIONS[language];
  const { texts, periodOptions, sessionLabels, locale } = languageDefinition;
  const themeCopy = texts.theme;
  const themeButtonLabel = theme === 'dark' ? themeCopy.toggleToLight : themeCopy.toggleToDark;
  const languageDisplayName = languageDefinition.shortName || languageDefinition.name;

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
  const nextRelative = nextLocal ? buildRelativeLabel(nextLocal, nowLocal, locale) : null;
  const nextCountdown =
    nextLocal && nextRelative
      ? nextLocal > nowLocal
        ? texts.countdownStart(nextRelative)
        : texts.countdownFinish(nextRelative)
      : null;
  const nextDescriptor = nextEvent
    ? `${nextEvent.round}${nextEvent.country ? ` • ${nextEvent.country}` : ''}`
    : texts.upcomingEventDescriptorFallback;
  const nextSessionLabel = nextEvent ? sessionLabels[nextEvent.session] ?? nextEvent.session : null;
  const nextLocationParts = nextEvent
    ? [nextEvent.circuit, nextEvent.country]
        .map(part => part?.trim())
        .filter((part): part is string => !!part && part.length > 0)
    : [];
  const nextLocationLabel =
    nextLocationParts.length > 0
      ? nextLocationParts.join(' • ')
      : nextEvent?.country ?? '';
  const nextDetailsLabel = nextEvent
    ? nextLocationLabel.length > 0
      ? nextLocationLabel
      : nextDescriptor === nextEvent.round
        ? ''
        : nextDescriptor
    : nextDescriptor;
  const heroSeriesDefinition = nextSeriesDefinition ?? FALLBACK_SERIES_DEFINITION;
  const heroAccentColor = heroSeriesDefinition?.accentColor ?? '#e10600';
  const heroAccentRgb = heroSeriesDefinition?.accentRgb ?? '225, 6, 0';
  const features = texts.features;
  const insightSteps = texts.insightsSteps;
  const faqItems = texts.faqItems;
  const footer = texts.footer;
  const privacyPolicy = texts.privacyPolicy;
  const currentYear = new Date().getFullYear();
  const footerLegal = footer.legal.replace('{year}', currentYear.toString());
  const privacyPolicyTitleId = 'privacy-policy-title';

  return (
    <div className="site" id="top">
      <header className="site-header" ref={headerRef}>
        <div className="site-header__inner">
          <div className="site-header__row site-header__row--main">
            <a className="site-header__brand" href="#top">
              <span className="site-header__brand-mark" aria-hidden>
                🏁
              </span>
              <span className="site-header__brand-text">{texts.brandName}</span>
            </a>
            <nav className="site-header__nav" aria-label={texts.brandName}>
              <a className="site-header__link" href="#features">
                {texts.navFeatures}
              </a>
              <a className="site-header__link" href="#faq">
                {texts.navFaq}
              </a>
            </nav>
            <div className="site-header__actions">
              <a className="site-header__cta" href="#schedule">
                {texts.heroCta}
              </a>
              <button
                type="button"
                className="theme-toggle"
                aria-label={themeButtonLabel}
                aria-pressed={theme === 'light'}
                data-theme-state={theme}
                onClick={toggleTheme}
              >
                <span className="theme-toggle__icons" aria-hidden>
                  <span className="theme-toggle__icon theme-toggle__icon--moon">🌙</span>
                  <span className="theme-toggle__icon theme-toggle__icon--sun">☀️</span>
                </span>
              </button>
              <div className="site-header__meta-group">
                <div
                  className="site-header__meta-portion site-header__language"
                  ref={languageControlRef}
                >
                  <button
                    type="button"
                    id="language-select"
                    className="site-header__language-toggle"
                    aria-haspopup="listbox"
                    aria-expanded={isLanguageMenuOpen}
                    aria-controls="language-select-menu"
                    onClick={() => setLanguageMenuOpen(prev => !prev)}
                  >
                    <span className="site-header__language-value">{languageDisplayName}</span>
                  </button>
                  {isLanguageMenuOpen ? (
                    <ul
                      className="site-header__language-menu"
                      role="listbox"
                      id="language-select-menu"
                      aria-labelledby="language-select"
                    >
                      {LANGUAGE_CODES.map(code => {
                        const definition = LANGUAGE_DEFINITIONS[code];
                        const isSelected = code === language;
                        return (
                          <li
                            key={code}
                            className="site-header__language-option"
                            role="option"
                            aria-selected={isSelected}
                          >
                            <button
                              type="button"
                              className="site-header__language-option-button"
                              data-active={isSelected}
                              onClick={() => {
                                setLanguage(code);
                                setLanguageMenuOpen(false);
                              }}
                            >
                              <span className="site-header__language-option-name">
                                {definition.name}
                              </span>
                              {isSelected && <span className="site-header__language-option-check">✓</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="page-shell">
        <section
          className="hero"
          id="schedule"
          style={
            {
              '--hero-accent': heroAccentColor,
              '--hero-accent-rgb': heroAccentRgb,
            } as CSSProperties
          }
        >
          <div className="hero__intro">
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
                <div className="hero-card__summary">
                  <div className="hero-card__summary-header">
                    <span className="hero-card__value">{nextLocal.toFormat('dd LLL • HH:mm')}</span>
                    {nextSeriesLabel || nextSessionLabel ? (
                      <div className="hero-card__summary-tags">
                        {nextSeriesLabel ? (
                          <span className="hero-card__tag hero-card__tag--accent">{nextSeriesLabel}</span>
                        ) : null}
                        {nextSessionLabel ? (
                          <span className="hero-card__tag hero-card__tag--muted">{nextSessionLabel}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="hero-card__summary-body">
                    <span className="hero-card__meta hero-card__meta--title">{nextEvent.round}</span>
                    {nextDetailsLabel ? (
                      <span className="hero-card__meta hero-card__meta--muted">
                        {nextDetailsLabel}
                      </span>
                    ) : null}
                  </div>
                  {nextCountdown ? (
                    <span className="hero-card__meta hero-card__meta--accent">{nextCountdown}</span>
                  ) : null}
                </div>
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
        <section className="events-section" aria-labelledby="schedule-heading">
          <div className="section-heading">
            <h2 id="schedule-heading" className="section-heading__title">
              {texts.scheduleTitle}
            </h2>
            <p className="section-heading__description">{texts.scheduleSubtitle}</p>
          </div>
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
              const relative = buildRelativeLabel(localized, nowLocal, locale);
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
                    <div className="event-card__info">
                      <span className="event-card__title">{r.round}</span>
                      {r.country ? (
                        <span className="event-card__country">{r.country}</span>
                      ) : null}
                      {r.circuit ? (
                        <span className="event-card__meta-line">{r.circuit}</span>
                      ) : null}
                      <span className="event-card__meta-line event-card__session">{sessionLabel}</span>
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
        </section>

        <section id="features" className="features-section" aria-labelledby="features-heading">
          <div className="section-heading">
            <h2 id="features-heading" className="section-heading__title">
              {texts.featuresTitle}
            </h2>
            <p className="section-heading__description">{texts.featuresSubtitle}</p>
          </div>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <article key={`${feature.title}-${index}`} className="feature-card" data-index={index}>
                <div className="feature-card__icon" aria-hidden>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="insights" className="insights-section" aria-labelledby="insights-heading">
          <div className="section-heading">
            <h2 id="insights-heading" className="section-heading__title">
              {texts.insightsTitle}
            </h2>
            <p className="section-heading__description">{texts.insightsSubtitle}</p>
          </div>
          <ol className="insights-list">
            {insightSteps.map((step, index) => (
              <li key={`${step.title}-${index}`} className="insights-item">
                <span className="insights-item__number">{String(index + 1).padStart(2, '0')}</span>
                <div className="insights-item__content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="faq" className="faq-section" aria-labelledby="faq-heading">
          <div className="section-heading">
            <h2 id="faq-heading" className="section-heading__title">
              {texts.faqTitle}
            </h2>
            <p className="section-heading__description">{texts.faqSubtitle}</p>
          </div>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <details key={`${item.question}-${index}`} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="cta" className="cta-section" aria-labelledby="cta-heading">
          <div className="cta-section__inner">
            <div className="cta-section__content">
              <h2 id="cta-heading">{texts.ctaTitle}</h2>
              <p>{texts.ctaSubtitle}</p>
            </div>
            <a className="cta-section__button" href="#schedule">
              {texts.ctaButton}
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand-block">
            <a className="site-footer__brand" href="#top">
              <span className="site-footer__brand-mark" aria-hidden>
                🏁
              </span>
              <span className="site-footer__brand-text">{texts.brandName}</span>
            </a>
            <p className="site-footer__tagline">{footer.tagline}</p>
            <div className="site-footer__contact">
              <span className="site-footer__contact-label">{footer.contactEmailLabel}</span>
              <a className="site-footer__contact-link" href={`mailto:${footer.contactEmail}`}>
                {footer.contactEmail}
              </a>
            </div>
          </div>
          <div className="site-footer__columns">
            <div className="site-footer__column">
              <h3 className="site-footer__heading">{footer.productHeading}</h3>
              <ul className="site-footer__list">
                {footer.productLinks.map(link => (
                  <li key={`${link.href}-${link.label}`} className="site-footer__list-item">
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-footer__column">
              <h3 className="site-footer__heading">{footer.resourcesHeading}</h3>
              <ul className="site-footer__list">
                {footer.resourcesLinks.map(link => (
                  <li key={`${link.href}-${link.label}`} className="site-footer__list-item">
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-footer__column">
              <h3 className="site-footer__heading">{footer.supportHeading}</h3>
              <ul className="site-footer__list">
                {footer.supportLinks.map(link => {
                  const isPrivacyLink = link.href === '#privacy' && privacyPolicy;
                  return (
                    <li key={`${link.href}-${link.label}`} className="site-footer__list-item">
                      {isPrivacyLink ? (
                        <button
                          type="button"
                          className="site-footer__list-button"
                          onClick={() => setPrivacyPolicyOpen(true)}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="site-footer__legal" id="privacy">
          <span>{footerLegal}</span>
        </div>
      </footer>
      {privacyPolicy && isPrivacyPolicyOpen ? (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby={privacyPolicyTitleId}>
          <div className="modal__backdrop" onClick={() => setPrivacyPolicyOpen(false)} />
          <div
            className="modal__dialog"
            role="document"
            ref={privacyPolicyDialogRef}
            tabIndex={-1}
          >
            <div className="modal__header">
              <div className="modal__headline">
                <h2 className="modal__title" id={privacyPolicyTitleId}>
                  {privacyPolicy.title}
                </h2>
                <p className="privacy-policy__meta">{privacyPolicy.lastUpdated}</p>
              </div>
              <button
                type="button"
                className="modal__close"
                onClick={() => setPrivacyPolicyOpen(false)}
              >
                {privacyPolicy.closeLabel}
              </button>
            </div>
            <div className="modal__content">
              {privacyPolicy.intro.map((paragraph, index) => (
                <p key={`privacy-intro-${index}`} className="privacy-policy__paragraph">
                  {paragraph}
                </p>
              ))}
              {privacyPolicy.sections.map((section, sectionIndex) => (
                <section className="privacy-policy__section" key={`privacy-section-${sectionIndex}`}>
                  <h3 className="privacy-policy__section-title">{section.title}</h3>
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p
                      key={`privacy-section-${sectionIndex}-paragraph-${paragraphIndex}`}
                      className="privacy-policy__paragraph"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.list ? (
                    <ul className="privacy-policy__list">
                      {section.list.map((item, itemIndex) => (
                        <li key={`privacy-section-${sectionIndex}-item-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
              <p className="privacy-policy__paragraph privacy-policy__conclusion">
                {privacyPolicy.conclusion}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
