/**
 * HAR Recording Example
 *
 * This test exists purely to record a HAR file from a real user flow.
 * The output is used as input for AI-assisted API test generation.
 *
 * Workflow:
 *   1. npm run har:record        → runs this test, produces output.har
 *   2. npm run har:convert       → strips noise, produces filtered-har.json
 *   3. Feed filtered-har.json to an AI with:
 *      "Read this HAR and generate Playwright API tests following the
 *       conventions in tests/api/ — one describe block, helpers from
 *       helpers.ts, authHeaders for auth, one test per scenario."
 *
 * Inspired by: https://bondaracademy.com/blog/generate-api-tests-with-ai-playwright
 */

import { test, expect } from '@playwright/test';
import { API_URL, BASE_URL } from '../config';

test('record: article create and delete flow', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: BASE_URL,
    recordHar: { path: 'output.har', mode: 'minimal' },
  });
  const page = await context.newPage();

  // Register a user and inject token
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const res = await page.request.post(`${API_URL}/api/users`, {
    data: {
      user: {
        email: `har-${uid}@quality-labs.com`,
        password: 'SecurePass123!',
        username: `qa-har-${uid}`.slice(0, 20),
      },
    },
  });
  const { user } = await res.json();

  await page.goto('/');
  await page.evaluate((token) => localStorage.setItem('jwtToken', token), user.token);
  await page.reload();
  await expect(page.getByText(user.username)).toBeVisible();

  // Create article via UI
  await page.goto('/editor');
  await page.getByPlaceholder('Article Title').fill(`HAR Test ${uid}`);
  await page.getByPlaceholder("What's this article about?").fill('HAR recording example');
  await page.getByPlaceholder('Write your article (in markdown)').fill('Body content for HAR.');
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/articles') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Publish Article' }).click(),
  ]);
  await page.waitForURL(/\/article\//);

  // Delete the article
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/articles') && r.request().method() === 'DELETE'),
    page.getByRole('button', { name: 'Delete Article' }).first().click(),
  ]);

  await context.close(); // HAR is written on context.close()
});
