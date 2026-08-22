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

export function useScheduleLoader(): ScheduleLoaderState {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setEvents([]);
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Deferred so the loader's state updates never run synchronously inside the
    // effect body (react-hooks/set-state-in-effect).
    void Promise.resolve().then(load);
  }, [load]);

  return { events, isLoading, isError, errorMessage, reload: () => void load() };
}
