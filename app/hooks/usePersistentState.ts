'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

type PersistentStateOptions<T> = {
  storageKey: string;
  initial: T;
  /** Converts the raw stored string into state. Throw to reject an invalid stored value. */
  read: (raw: string) => T;
  /** Serializes state for storage. Defaults to JSON. */
  write?: (value: T) => string;
};

/**
 * State synced with localStorage. The stored value is applied after mount (never during
 * hydration, so prerendered markup stays consistent) and every subsequent change is
 * persisted — but never before the initial read has completed.
 */
export function usePersistentState<T>({
  storageKey,
  initial,
  read,
  write = value => JSON.stringify(value),
}: PersistentStateOptions<T>): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [hasLoaded, setHasLoaded] = useState(false);
  const readRef = useRef(read);
  readRef.current = read;
  const writeRef = useRef(write);
  writeRef.current = write;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setValue(readRef.current(stored));
      }
    } catch (error) {
      console.error(error);
    }
    setHasLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(storageKey, writeRef.current(value));
    } catch (error) {
      console.error(error);
    }
  }, [hasLoaded, storageKey, value]);

  return [value, setValue];
}
