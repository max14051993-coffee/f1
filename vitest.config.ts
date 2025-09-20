import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
});
