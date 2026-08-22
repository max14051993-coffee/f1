'use client';

import { CSSProperties } from 'react';

import type { RaceSession, TranslationBundle } from '../../lib/language';
import { SERIES_DEFINITIONS } from '../../lib/series';
import { getTrackLayout } from '../../lib/track-layouts';
import {
  buildCountdownLabel,
  type CountdownCopy,
  type LocalizedScheduleEvent,
} from '../../lib/schedule';

type EventCardProps = {
  localized: LocalizedScheduleEvent;
  texts: TranslationBundle;
  sessionLabels: Record<RaceSession, string>;
  countdownCopy: CountdownCopy;
};

export function EventCard({ localized, texts, sessionLabels, countdownCopy }: EventCardProps) {
  const { event, localStart, status, startRelative, finishRelative } = localized;
  const definition = SERIES_DEFINITIONS[event.series];
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
      [event.circuit, event.round].filter((part): part is string => !!part && part.trim().length > 0),
    ),
  );
  const trackLabel = texts.trackLayoutLabel(trackLabelParts);
  const sessionLabel = sessionLabels[event.session] ?? event.session;

  return (
    <li
      className="event-card"
      style={
        {
          '--accent-color': definition.accentColor,
          '--accent-rgb': definition.accentRgb,
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
          {event.country ? <span className="event-card__country">{event.country}</span> : null}
          {event.circuit ? <span className="event-card__meta-line">{event.circuit}</span> : null}
          <span className="event-card__meta-line event-card__session">{sessionLabel}</span>
        </div>
        {track ? (
          <div className="event-card__track">
            <svg viewBox={track.layout.viewBox} role="img" aria-label={trackLabel} focusable="false">
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
}
