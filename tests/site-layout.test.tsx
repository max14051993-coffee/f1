import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Home from '../app/page';
import { DEFAULT_LANGUAGE, LANGUAGE_CODES, LANGUAGE_DEFINITIONS } from '../lib/language';

const LANGUAGE_STORAGE_KEY = 'schedule-language';

describe('site layout rendering across languages', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
    const eventStart = DateTime.utc().plus({ days: 5 }).toFormat("yyyyMMdd'T'HHmmss'Z'");
    const sampleIcs = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:F1 | Bahrain Grand Prix | Bahrain | Sakhir | Race',
      `DTSTART:${eventStart}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    fetchMock = vi.fn(async () => ({
      ok: true,
      text: async () => sampleIcs,
    }));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('renders localized hero, schedule, and supporting sections for every language', async () => {
    expect(typeof window.matchMedia).toBe('function');
    expect(window.matchMedia('(prefers-color-scheme: light)')).toBeTruthy();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(<Home />);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });

      expect(errorSpy).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(document.querySelectorAll('.event-card').length).toBeGreaterThan(0);
      }, { timeout: 5000 });

      for (const code of LANGUAGE_CODES) {
        const definition = LANGUAGE_DEFINITIONS[code];
        const toggle = document.getElementById('language-select');
        expect(toggle).toBeTruthy();
        fireEvent.click(toggle!);

        const optionLabel = await screen.findByText(definition.name);
        const optionButton = optionLabel.closest('button');
        expect(optionButton).toBeTruthy();
        fireEvent.click(optionButton!);

        await waitFor(() => {
          expect(screen.getByText(definition.texts.heroSubtitle)).toBeTruthy();
        });

        await waitFor(() => {
          expect(
            screen.getByRole('heading', { level: 2, name: definition.texts.scheduleTitle }),
          ).toBeTruthy();
        });

        await waitFor(() => {
          expect(screen.getAllByText(definition.sessionLabels.Race).length).toBeGreaterThan(0);
        });

        await waitFor(() => {
          expect(document.getElementById('language-select')?.textContent).toContain(
            definition.shortName,
          );
        });

        await waitFor(() => {
          expect(document.querySelectorAll('.feature-card').length).toBe(definition.texts.features.length);
        });

        await waitFor(() => {
          expect(document.querySelectorAll('.insights-item').length).toBe(
            definition.texts.insightsSteps.length,
          );
        });

        await waitFor(() => {
          expect(document.querySelectorAll('.faq-item').length).toBe(definition.texts.faqItems.length);
        });

        await waitFor(() => {
          expect(document.querySelectorAll('.event-card__series-pill').length).toBeGreaterThan(0);
        });
      }
    } finally {
      errorSpy.mockRestore();
    }
  });
});
