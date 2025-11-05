import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      'src/**/*.d.ts',
      'src/**/*.stories.{js,jsx,ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/test-utils.tsx',
        'coverage/',
        'dist/',
        '.{idea,git,.cache,.output,*.log}',
        'vitest.config.*',
        'cypress/**/*',
        'cypress.config.*',
        'tests-e2e/**/*',
      ],
    },
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:5173',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});