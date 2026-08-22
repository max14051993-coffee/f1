'use client';

import { useCallback, useEffect, useState } from 'react';

import { parseSchedule, type ScheduleEvent } from '../../lib/ics';
import { SCHEDULE_URL } from '../../lib/calendar-link';

type ScheduleLoaderState = {
  events: ScheduleEvent[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  reload: () => void;
};

export function useScheduleLoader(initialEvents: ScheduleEvent[] = []): ScheduleLoaderState {
  // Build-time prerendered schedule seeds the state so crawlers and JS-less
  // visitors get real content immediately; the fetch below refreshes it.
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(initialEvents.length === 0);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const response = await fetch(SCHEDULE_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setEvents(parseSchedule(await response.text()));
    } catch (error) {
      if (initialEvents.length === 0) {
        setEvents([]);
      }
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, [initialEvents]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  return { events, isLoading, isError, errorMessage, reload: () => void load() };
}
