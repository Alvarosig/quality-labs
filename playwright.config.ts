import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://conduit.bondaracademy.com';
const API_URL = process.env.API_URL || 'https://conduit-api.bondaracademy.com';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
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
