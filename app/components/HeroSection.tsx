'use client';

import { CSSProperties } from 'react';

import type { LanguageDefinition } from '../../lib/language';
import { buildEventIcsDeepLink, buildEventIcsFile } from '../../lib/calendar-link';
import { FALLBACK_SERIES_DEFINITION, SERIES_DEFINITIONS, SERIES_IDS, type SeriesId } from '../../lib/series';
import { buildCountdownLabel, type CountdownCopy, type LocalizedScheduleEvent } from '../../lib/schedule';

type HeroSectionProps = {
  definition: LanguageDefinition;
  language: string;
  events: LocalizedScheduleEvent[];
  filteredCount: number;
  visibleSeries: Record<SeriesId, boolean>;
  onToggleSeries: (series: SeriesId) => void;
  hours?: number;
  onSelectHours: (hours?: number) => void;
  countdownCopy: CountdownCopy;
};

export function HeroSection({
  definition,
  language,
  events,
  filteredCount,
  visibleSeries,
  onToggleSeries,
  hours,
  onSelectHours,
  countdownCopy,
}: HeroSectionProps) {
  const { texts, periodOptions, sessionLabels } = definition;

  const activeSeries = (Object.entries(visibleSeries) as [SeriesId, boolean][])
    .filter(([, active]) => active)
    .map(([series]) => series);
  const hasActiveSeries = activeSeries.length > 0;
  const activeSeriesSelection = hasActiveSeries
    ? texts.activeSelection(activeSeries.map(series => SERIES_DEFINITIONS[series].label))
    : texts.allSeriesHidden;
  const selectedPeriodLabel = periodOptions.find(option => option.value === hours)?.label ?? '';

  const nextLocalized = events[0];
  const nextEvent = nextLocalized?.event;
  const nextSeriesDefinition = nextEvent ? SERIES_DEFINITIONS[nextEvent.series] : undefined;
  const heroSeriesDefinition = nextSeriesDefinition ?? FALLBACK_SERIES_DEFINITION;
  const heroSeriesLabel =
    nextSeriesDefinition?.label ?? nextEvent?.series ?? FALLBACK_SERIES_DEFINITION.label;
  const nextSessionLabel = nextEvent ? (sessionLabels[nextEvent.session] ?? nextEvent.session) : null;
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
  const nextLocationParts = nextEvent
    ? [nextEvent.circuit, nextEvent.country]
        .map(part => part?.trim())
        .filter((part): part is string => !!part && part.length > 0)
    : [];
  const nextLocationLabel =
    nextLocationParts.length > 0 ? nextLocationParts.join(' • ') : (nextEvent?.country ?? '');
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
  const nextEventCalendarLink = nextEvent ? buildEventIcsDeepLink(nextEvent) : undefined;
  const nextEventCalendarFile = nextEvent ? buildEventIcsFile(nextEvent) : undefined;

  const mobileNextEventLabel = language === 'ru' ? 'Следующее событие через' : 'Next event in';
  const mobileOpenLabel = language === 'ru' ? 'Открыть' : 'Open';
  const addToCalendarLabel = language === 'ru' ? 'Добавить в календарь' : 'Add to calendar';

  return (
    <>
      <section
        className="hero"
        id="schedule"
        style={
          {
            '--hero-accent': heroSeriesDefinition.accentColor,
            '--hero-accent-rgb': heroSeriesDefinition.accentRgb,
          } as CSSProperties
        }
      >
        <div className="hero__intro">
          <h1 className="hero__title">{texts.heroTitle}</h1>
          <p className="hero__subtitle">{texts.heroSubtitle}</p>
        </div>
        <div className="hero__layout">
          <div className="hero__column hero__column--controls">
            <div className="hero-card">
              <div className="hero-card__section">
                <div className="hero-card__section-header">
                  <span className="control-panel__label">{texts.seriesLabel}</span>
                  <span className="control-panel__selection" aria-live="polite" data-empty={!hasActiveSeries}>
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
                          onChange={() => onToggleSeries(series)}
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
                  {periodOptions.map(option => (
                    <button
                      key={option.label}
                      type="button"
                      className="period-button"
                      data-active={hours === option.value}
                      onClick={() => onSelectHours(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="hero__event-summary">
                  <span className="hero__event-summary-label">{texts.eventsInWindowLabel}</span>
                  <span className="hero__event-summary-value">{filteredCount}</span>
                  <span className="hero__event-summary-period">{selectedPeriodLabel}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero__column hero__column--summary">
            <div className="hero-card hero-card--summary">
              <span className="hero-card__label">{texts.nextStartLabel}</span>
              {nextEvent && nextLocalized.localStart ? (
                <div className="hero-card__summary">
                  <div className="hero-card__summary-header">
                    <span className="hero-card__value">
                      {nextLocalized.localStart.toFormat('dd LLL • HH:mm')}
                    </span>
                    {heroSeriesLabel || nextSessionLabel ? (
                      <div className="hero-card__summary-tags">
                        {heroSeriesLabel ? (
                          <span className="hero-card__tag hero-card__tag--accent">{heroSeriesLabel}</span>
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
                      <span className="hero-card__meta hero-card__meta--muted">{nextDetailsLabel}</span>
                    ) : null}
                  </div>
                  {nextCountdown ? (
                    <div
                      className={nextCountdownClassName}
                      aria-live={nextStatus === 'live' ? 'polite' : 'off'}
                    >
                      <span className="event-card__countdown-dot" aria-hidden />
                      <span>{nextCountdown}</span>
                    </div>
                  ) : null}
                  {nextEventCalendarLink ? (
                    <a
                      className="hero-card__calendar-button"
                      href={nextEventCalendarLink}
                      download={nextEventCalendarFile}
                    >
                      {addToCalendarLabel}
                    </a>
                  ) : null}
                </div>
              ) : (
                <>
                  <span className="hero-card__value">{texts.noEvents}</span>
                  <span className="hero-card__meta hero-card__meta--muted">{texts.extendPeriodHint}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      {nextCountdown ? (
        <a className="mobile-next-event" href="#schedule">
          <span>{mobileNextEventLabel}</span>
          <strong>{nextCountdown}</strong>
          <em>{mobileOpenLabel}</em>
        </a>
      ) : null}
    </>
  );
}
