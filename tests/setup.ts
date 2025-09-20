import { vi } from 'vitest';

if (typeof window !== 'undefined') {
  const matchMediaMock = vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }));

  window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
}

if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = vi.fn();
}
