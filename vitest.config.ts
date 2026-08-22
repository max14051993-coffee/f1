import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Next.js pins tsconfig jsx=preserve, so tests get their own JSX transform.
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});
