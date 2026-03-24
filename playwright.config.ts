import { defineConfig } from '@playwright/test';
import { BASE_URL, API_URL } from './tests/config';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_URL,
      },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        baseURL: BASE_URL,
        browserName: 'chromium',
      },
    },
  ],
});
