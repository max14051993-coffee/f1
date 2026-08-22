'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { LANGUAGE_DEFINITIONS } from '../lib/language';
import { buildSeriesVisibility, SERIES_IDS, type SeriesId } from '../lib/series';
import { filterEventsByVisibility, localizeEvent } from '../lib/schedule';
import { PERIOD_HOUR_OPTIONS, PERIOD_STORAGE_KEY, SERIES_STORAGE_KEY } from '../lib/preferences';

import { EventsSection } from './components/EventsSection';
import { HeroSection } from './components/HeroSection';
import { InfoSections } from './components/InfoSections';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { useLanguagePreference } from './hooks/useLanguagePreference';
import { usePersistentState } from './hooks/usePersistentState';
import { useScheduleLoader } from './hooks/useScheduleLoader';
import { useThemePreference } from './hooks/useThemePreference';

const INITIAL_VISIBLE_EVENTS = 24;
const VISIBLE_EVENTS_STEP = 24;
const COUNTDOWN_REFRESH_INTERVAL_MS = 30_000;

function readStoredSeriesVisibility(raw: string): Record<SeriesId, boolean> {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid stored series visibility');
  }
  const source = parsed as Record<string, unknown>;
  const next = buildSeriesVisibility(true);
  let hasValid = false;
  for (const series of SERIES_IDS) {
    if (typeof source[series] === 'boolean') {
      next[series] = source[series];
      hasValid = true;
    }
  }
  if (!hasValid) {
    throw new Error('No valid series visibility flags stored');
  }
  return next;
}

function readStoredHours(raw: string): number | undefined {
  if (raw === 'all') return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!PERIOD_HOUR_OPTIONS.includes(parsed)) {
    throw new Error(`Invalid stored period: ${raw}`);
  }
  return parsed;
}

function writeStoredHours(hours: number | undefined) {
  return hours === undefined ? 'all' : hours.toString(10);
}

export default function Home() {
  const { theme, toggleTheme } = useThemePreference();
  const [language, setLanguage] = useLanguagePreference();
  const { events, isLoading, isError, errorMessage, reload } = useScheduleLoader();

  const [visibleSeries, setVisibleSeries] = usePersistentState<Record<SeriesId, boolean>>({
    storageKey: SERIES_STORAGE_KEY,
    initial: buildSeriesVisibility(true),
    read: readStoredSeriesVisibility,
  });
  const [hours, setHours] = usePersistentState<number | undefined>({
    storageKey: PERIOD_STORAGE_KEY,
    initial: undefined,
    read: readStoredHours,
    write: writeStoredHours,
  });

  const [isPrivacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

  // Relative labels and countdowns must keep ticking even when nothing else re-renders.
  const [now, setNow] = useState(() => DateTime.local());
  useEffect(() => {
    const interval = setInterval(() => setNow(DateTime.local()), COUNTDOWN_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const definition = LANGUAGE_DEFINITIONS[language];
  const { texts, locale } = definition;
  const countdownCopy = useMemo(
    () => ({
      countdownLive: texts.countdownLive,
      countdownFinish: texts.countdownFinish,
      countdownStart: texts.countdownStart,
      countdownScheduled: texts.countdownScheduled,
    }),
    [texts],
  );

  const filtered = useMemo(
    () => filterEventsByVisibility(events, visibleSeries, hours),
    [events, visibleSeries, hours],
  );

  const localizedEvents = useMemo(
    () => filtered.map(event => localizeEvent(event, now.zoneName, locale, now.setLocale(locale))),
    [filtered, locale, now],
  );

  const [visibleEventsCount, setVisibleEventsCount] = useState(INITIAL_VISIBLE_EVENTS);
  useEffect(() => {
    setVisibleEventsCount(INITIAL_VISIBLE_EVENTS);
  }, [events, visibleSeries, hours]);
  const visibleEvents = useMemo(
    () => localizedEvents.slice(0, visibleEventsCount),
    [localizedEvents, visibleEventsCount],
  );
  const hasMoreEvents = visibleEventsCount < localizedEvents.length;

  return (
    <div className="site" id="top">
      <SiteHeader
        texts={texts}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onSelectLanguage={setLanguage}
      />

      <main className="page-shell">
        <HeroSection
          definition={definition}
          language={language}
          events={localizedEvents}
          filteredCount={filtered.length}
          visibleSeries={visibleSeries}
          onToggleSeries={series => setVisibleSeries(prev => ({ ...prev, [series]: !prev[series] }))}
          hours={hours}
          onSelectHours={setHours}
          countdownCopy={countdownCopy}
        />
        <EventsSection
          definition={definition}
          events={visibleEvents}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          hasMore={hasMoreEvents}
          remainingCount={Math.max(localizedEvents.length - visibleEvents.length, 0)}
          language={language}
          countdownCopy={countdownCopy}
          onLoadMore={() => setVisibleEventsCount(count => count + VISIBLE_EVENTS_STEP)}
          onRetry={reload}
        />
        <InfoSections texts={texts} />
      </main>

      <SiteFooter
        brandName={texts.brandName}
        footer={texts.footer}
        onOpenPrivacyPolicy={() => setPrivacyPolicyOpen(true)}
      />
      {isPrivacyPolicyOpen ? (
        <PrivacyPolicyModal policy={texts.privacyPolicy} onClose={() => setPrivacyPolicyOpen(false)} />
      ) : null}
    </div>
  );
}
