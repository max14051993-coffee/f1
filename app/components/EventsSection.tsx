'use client';

import type { LanguageDefinition } from '../../lib/language';
import { SCHEDULE_URL } from '../../lib/calendar-link';
import { EventCard } from './EventCard';
import type { CountdownCopy, LocalizedScheduleEvent } from '../../lib/schedule';

type EventsSectionProps = {
  definition: LanguageDefinition;
  events: LocalizedScheduleEvent[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  hasMore: boolean;
  remainingCount: number;
  language: string;
  countdownCopy: CountdownCopy;
  onLoadMore: () => void;
  onRetry: () => void;
};

export function EventsSection({
  definition,
  events,
  isLoading,
  isError,
  errorMessage,
  hasMore,
  remainingCount,
  language,
  countdownCopy,
  onLoadMore,
  onRetry,
}: EventsSectionProps) {
  const { texts, sessionLabels } = definition;
  const loadMoreLabel =
    language === 'ru' ? `Показать ещё (${remainingCount})` : `Show more (${remainingCount})`;

  return (
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
          <button type="button" className="schedule-error__retry" onClick={onRetry}>
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
          : events.map(localized => (
              <EventCard
                key={`${localized.event.series}-${localized.event.startsAtUtc}`}
                localized={localized}
                texts={texts}
                sessionLabels={sessionLabels}
                countdownCopy={countdownCopy}
              />
            ))}
      </ul>
      {!isLoading && hasMore ? (
        <div className="events-section__actions">
          <button type="button" className="schedule-error__retry" onClick={onLoadMore}>
            {loadMoreLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
