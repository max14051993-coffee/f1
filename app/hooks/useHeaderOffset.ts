'use client';

import { RefObject, useEffect } from 'react';

const HEADER_MARGIN = 24;

/** Keeps the `--site-header-offset` CSS variable in sync with the rendered header height. */
export function useHeaderOffset(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const root = document.documentElement;
    const updateOffset = () => {
      root.style.setProperty(
        '--site-header-offset',
        `${Math.ceil(header.getBoundingClientRect().height + HEADER_MARGIN)}px`,
      );
    };

    updateOffset();

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    return () => observer.disconnect();
  }, [headerRef]);
}
