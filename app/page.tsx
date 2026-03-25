'use client';

import { CSSProperties, KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_CODES,
  LANGUAGE_DEFINITIONS,
  type LanguageCode,
  isLanguageCode,
} from '../lib/language';
import { getTrackLayout } from '../lib/track-layouts';
import {
  buildSeriesVisibility,
  FALLBACK_SERIES_DEFINITION,
  SERIES_DEFINITIONS,
  SERIES_IDS,
  type SeriesId,
} from '../lib/series';
import { parseSchedule, type ScheduleEvent } from '../lib/ics';
import { buildCountdownLabel, filterEventsByVisibility, localizeEvent } from '../lib/schedule';
import { LANGUAGE_STORAGE_KEY, PERIOD_STORAGE_KEY, SERIES_STORAGE_KEY } from '../lib/preferences';
import { useThemePreference } from './hooks/useThemePreference';

const SCHEDULE_URL = './schedule.ics';
const INITIAL_VISIBLE_EVENTS = 24;
const VISIBLE_EVENTS_STEP = 24;

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(element => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
}

export default function Home() {
  const { theme, toggleTheme } = useThemePreference();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
  const [focusedLanguageIndex, setFocusedLanguageIndex] = useState(0);
  const [visibleEventsCount, setVisibleEventsCount] = useState(INITIAL_VISIBLE_EVENTS);
  const headerRef = useRef<HTMLElement | null>(null);
  const languageControlRef = useRef<HTMLDivElement | null>(null);
  const languageToggleRef = useRef<HTMLButtonElement | null>(null);
  const languageOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const privacyPolicyDialogRef = useRef<HTMLDivElement | null>(null);
  const privacyPolicyTriggerRef = useRef<HTMLElement | null>(null);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const response = await fetch(SCHEDULE_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      const parsed = parseSchedule(text);
      setEvents(parsed);
    } catch (error) {
      setEvents([]);
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule().catch(console.error);
    setUserTz(DateTime.local().zoneName);
  }, [loadSchedule]);

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
    setVisibleEventsCount(INITIAL_VISIBLE_EVENTS);
  }, [events, visibleSeries, hours]);

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

    const dialog = privacyPolicyDialogRef.current;
    if (!dialog) {
      return;
    }

    const focusable = getFocusableElements(dialog);
    (focusable[0] ?? dialog).focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPrivacyPolicyOpen(false);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dynamicFocusable = getFocusableElements(dialog);
      if (dynamicFocusable.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = dynamicFocusable[0];
      const last = dynamicFocusable[dynamicFocusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      privacyPolicyTriggerRef.current?.focus?.();
      privacyPolicyTriggerRef.current = null;
    };
  }, [isPrivacyPolicyOpen]);

  useEffect(() => {
    if (!isLanguageMenuOpen) {
      return;
    }

    const selectedIndex = Math.max(
      0,
      LANGUAGE_CODES.findIndex(code => code === language),
    );
    setFocusedLanguageIndex(selectedIndex);
  }, [isLanguageMenuOpen, language]);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;
    languageOptionRefs.current[focusedLanguageIndex]?.focus({ preventScroll: true });
  }, [isLanguageMenuOpen, focusedLanguageIndex]);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLanguageMenuOpen(false);
        languageToggleRef.current?.focus({ preventScroll: true });
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
  const countdownCopy = {
    countdownLive: texts.countdownLive,
    countdownFinish: texts.countdownFinish,
    countdownStart: texts.countdownStart,
    countdownScheduled: texts.countdownScheduled,
  };

  const filtered = useMemo(
    () => filterEventsByVisibility(events, visibleSeries, hours),
    [events, visibleSeries, hours],
  );

  const localizedEvents = useMemo(() => {
    const nowLocal = DateTime.local().setZone(userTz).setLocale(locale);
    return filtered.map(event => localizeEvent(event, userTz, locale, nowLocal));
  }, [filtered, userTz, locale]);
  const visibleEvents = useMemo(
    () => localizedEvents.slice(0, visibleEventsCount),
    [localizedEvents, visibleEventsCount],
  );
  const hasMoreEvents = visibleEventsCount < localizedEvents.length;
  const remainingEvents = Math.max(localizedEvents.length - visibleEvents.length, 0);
  const loadMoreLabel =
    language === 'ru' ? `Показать ещё (${remainingEvents})` : `Show more (${remainingEvents})`;
  const activeSeries = (Object.entries(visibleSeries) as [SeriesId, boolean][])
    .filter(([, active]) => active)
    .map(([series]) => series);
  const activeSeriesNames = activeSeries.map(series => SERIES_DEFINITIONS[series].label);
  const hasActiveSeries = activeSeriesNames.length > 0;
  const activeSeriesSelection = hasActiveSeries
    ? texts.activeSelection(activeSeriesNames)
    : texts.allSeriesHidden;
  const selectedPeriodLabel =
    periodOptions.find(opt => opt.value === hours)?.label ??
    periodOptions[periodOptions.length - 1]?.label ??
    '';
  const nextLocalized = localizedEvents[0];
  const nextEvent = nextLocalized?.event;
  const nextSeriesDefinition = nextEvent ? SERIES_DEFINITIONS[nextEvent.series] : undefined;
  const nextSeriesLabel = nextSeriesDefinition?.label ?? nextEvent?.series ?? '';
  const nextLocal = nextLocalized?.localStart ?? null;
  const nextCountdown = nextLocalized
    ? buildCountdownLabel(
        nextLocalized.status,
        nextLocalized.startRelative,
        nextLocalized.finishRelative,
        countdownCopy,
      )
    : null;
  const nextStatus = nextLocalized?.status ?? 'upcoming';
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
  const nextCountdownClassName =
    nextStatus === 'upcoming'
      ? 'event-card__countdown hero-card__countdown'
      : `event-card__countdown event-card__countdown--${nextStatus} hero-card__countdown`;
  const heroSeriesDefinition = nextSeriesDefinition ?? FALLBACK_SERIES_DEFINITION;
  const heroSeriesLabel = heroSeriesDefinition?.label ?? nextSeriesLabel ?? '';
  const localizedHeroTitle = texts.heroTitle(heroSeriesLabel);
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
  const privacyPolicyDescriptionId = 'privacy-policy-description';
  const languageMenuLabel =
    language === 'ru'
      ? `Выбор языка. Текущий язык: ${languageDisplayName}`
      : `Language selector. Current language: ${languageDisplayName}`;

  const handleLanguageToggleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const selectedIndex = Math.max(
        0,
        LANGUAGE_CODES.findIndex(code => code === language),
      );
      setFocusedLanguageIndex(selectedIndex);
      setLanguageMenuOpen(true);
    }
  };

  const handleLanguageMenuKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedLanguageIndex(prev => (prev + 1) % LANGUAGE_CODES.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedLanguageIndex(prev => (prev - 1 + LANGUAGE_CODES.length) % LANGUAGE_CODES.length);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setFocusedLanguageIndex(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      setFocusedLanguageIndex(LANGUAGE_CODES.length - 1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const code = LANGUAGE_CODES[focusedLanguageIndex];
      if (code) {
        setLanguage(code);
      }
      setLanguageMenuOpen(false);
      languageToggleRef.current?.focus({ preventScroll: true });
    }
  };
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
                role="switch"
                aria-checked={theme === 'dark'}
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
                    aria-label={languageMenuLabel}
                    ref={languageToggleRef}
                    onClick={() => setLanguageMenuOpen(prev => !prev)}
                    onKeyDown={handleLanguageToggleKeyDown}
                  >
                    <span className="site-header__language-value">{languageDisplayName}</span>
                  </button>
                  {isLanguageMenuOpen ? (
                    <ul
                      className="site-header__language-menu"
                      role="listbox"
                      id="language-select-menu"
                      aria-labelledby="language-select"
                      onKeyDown={handleLanguageMenuKeyDown}
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
                              ref={element => {
                                languageOptionRefs.current[LANGUAGE_CODES.indexOf(code)] = element;
                              }}
                              onClick={() => {
                                setLanguage(code);
                                setLanguageMenuOpen(false);
                                languageToggleRef.current?.focus({ preventScroll: true });
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
            <h1 className="hero__title">{localizedHeroTitle}</h1>
            <p className="hero__subtitle">{texts.heroSubtitle}</p>
          </div>
          <div className="hero__layout">
            <div className="hero__column hero__column--controls">
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
            <div className="hero__column hero__column--summary">
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
                      <div className={nextCountdownClassName} aria-live={nextStatus === 'live' ? 'polite' : 'off'}>
                        <span className="event-card__countdown-dot" aria-hidden />
                        <span>{nextCountdown}</span>
                      </div>
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
          {isError ? (
            <div className="schedule-error" role="alert">
              <div className="schedule-error__content">
                <p className="schedule-error__title">{texts.scheduleErrorTitle}</p>
                <p className="schedule-error__description">{texts.scheduleErrorDescription}</p>
                <p className="schedule-error__fallback">
                  {texts.scheduleErrorFallbackPrefix}{' '}
                  <a href={SCHEDULE_URL} target="_blank" rel="noreferrer noopener">
                    {texts.scheduleIcsLinkLabel}
                  </a>
                  {errorMessage ? ` (${errorMessage})` : null}
                </p>
              </div>
              <button type="button" className="schedule-error__retry" onClick={() => void loadSchedule()}>
                {texts.scheduleRetryButton}
              </button>
            </div>
          ) : null}
          <ul className="events-grid">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <li
                    key={`event-skeleton-${index}`}
                    className="event-card event-card--skeleton"
                    aria-label={texts.scheduleLoadingLabel}
                  >
                    <div className="event-card__inner" />
                  </li>
                ))
              : visibleEvents.map((localized, index) => {
              const { event, localStart, status, startRelative, finishRelative } = localized;
              const definition = SERIES_DEFINITIONS[event.series];
              const accentColor = definition.accentColor;
              const accentRgb = definition.accentRgb;
              const isoLocal = localStart.toISO();
              const timeLabel = localStart.toFormat('HH:mm');
              const dayLabel = localStart.toFormat('ccc');
              const dateLabel = localStart.toFormat('dd LLL');
              const countdown = buildCountdownLabel(status, startRelative, finishRelative, countdownCopy);
              const countdownClassName =
                status === 'upcoming'
                  ? 'event-card__countdown'
                  : `event-card__countdown event-card__countdown--${status}`;
              const track = getTrackLayout(event.circuit, event.round);
              const trackLabelParts = Array.from(
                new Set(
                  [event.circuit, event.round].filter(
                    (part): part is string => !!part && part.trim().length > 0,
                  ),
                ),
              );
              const trackLabel = texts.trackLayoutLabel(trackLabelParts);
              const sessionLabel = sessionLabels[event.session] ?? event.session;

              return (
                <li
                  key={`${event.startsAtUtc}-${index}`}
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
                        <img
                          src={definition.logo.src}
                          alt=""
                          width={definition.logo.width}
                          height={definition.logo.height}
                          className="event-card__series-logo"
                          loading="lazy"
                          aria-hidden="true"
                          draggable={false}
                        />
                      </div>
                      <time className="event-card__datetime" dateTime={isoLocal ?? undefined}>
                        <span className="event-card__time">{timeLabel}</span>
                        <span className="event-card__date">
                          {dayLabel}, {dateLabel}
                        </span>
                      </time>
                    </div>
                    <div className="event-card__info">
                      <span className="event-card__title">{event.round}</span>
                      {event.country ? (
                        <span className="event-card__country">{event.country}</span>
                      ) : null}
                      {event.circuit ? (
                        <span className="event-card__meta-line">{event.circuit}</span>
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
                    <div className={countdownClassName} aria-live={status === 'live' ? 'polite' : 'off'}>
                      <span className="event-card__countdown-dot" aria-hidden />
                      <span>{countdown}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {!isLoading && hasMoreEvents ? (
            <div className="events-section__actions">
              <button
                type="button"
                className="schedule-error__retry"
                onClick={() => setVisibleEventsCount(prev => prev + VISIBLE_EVENTS_STEP)}
              >
                {loadMoreLabel}
              </button>
            </div>
          ) : null}
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
                          onClick={event => {
                            privacyPolicyTriggerRef.current = event.currentTarget;
                            setPrivacyPolicyOpen(true);
                          }}
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
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={privacyPolicyTitleId}
          aria-describedby={privacyPolicyDescriptionId}
        >
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
            <div className="modal__content" id={privacyPolicyDescriptionId}>
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
