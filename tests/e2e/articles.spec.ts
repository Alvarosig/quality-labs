import { test, expect } from '@playwright/test';
import { ArticleEditorPage } from './pages/ArticleEditorPage';
import { ArticlePage } from './pages/ArticlePage';
import { API_URL } from '../config';

// Each test gets its own user + auth (no flakiness)
let authToken: string;
let username: string;

test.beforeEach(async ({ page, request }) => {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  username = `qa-art-${uid}`.slice(0, 20);
  const email = `art-${uid}@quality-labs.com`;
  const password = 'SecurePass123!';

  const res = await request.post(`${API_URL}/api/users`, {
    data: { user: { email, password, username } },
  });
  const body = await res.json();
  authToken = body.user.token;

  // Set token in localStorage, Conduit-specific way
  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('jwtToken', token);
  }, authToken);
  await page.reload();

  await expect(page.getByText(username)).toBeVisible();
});

test.describe('Article CRUD via UI', () => {
  test('should create and view an article', async ({ page }) => {
    const editor = new ArticleEditorPage(page);
    const uid = Date.now();

    const articleData = {
      title: `Test Article ${uid}`,
      description: 'An article created by E2E tests',
      body: 'This is the **markdown** body of the article.\n\nWith multiple paragraphs.',
      tags: ['e2e-test', 'quality-labs'],
    };

    await editor.goto();
    await editor.fillArticle(
      articleData.title,
      articleData.description,
      articleData.body,
      articleData.tags
    );
    const slug = await editor.publish();

    const articlePage = new ArticlePage(page);
    await expect(page).toHaveURL(`/article/${slug}`);

    await expect(articlePage.title).toHaveText(articleData.title);
    await expect(articlePage.body).toContainText('markdown');
    await expect(articlePage.tagList).toContainText('e2e-test');

    await expect(articlePage.editButton).toBeVisible();
    await expect(articlePage.deleteButton).toBeVisible();
  });

  test('should edit an existing article', async ({ page, request }) => {
    const editor = new ArticleEditorPage(page);
    const uid = Date.now();

    const createRes = await request.post(`${API_URL}/api/articles`, {
      headers: { Authorization: `Token ${authToken}` },
      data: {
        article: {
          title: `Edit Me ${uid}`,
          description: 'Will be edited',
          body: 'Original content',
        },
      },
    });
    const { article } = await createRes.json();

    const articlePage = new ArticlePage(page);
    await articlePage.goto(article.slug);
    await articlePage.editButton.click();

    await editor.bodyInput.fill('Updated content via E2E test');

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/api/articles/') &&
          resp.request().method() === 'PUT'
      ),
      editor.publishButton.click(),
    ]);

    await page.waitForURL(/\/article\//);

    await expect(articlePage.body).toContainText(
      'Updated content via E2E test'
    );
  });

  test('should delete an article', async ({ page, request }) => {
    const uid = Date.now();

    const createRes = await request.post(`${API_URL}/api/articles`, {
      headers: { Authorization: `Token ${authToken}` },
      data: {
        article: {
          title: `Delete Me ${uid}`,
          description: 'Will be deleted',
          body: 'This article will be deleted',
        },
      },
    });
    const { article } = await createRes.json();

    const articlePage = new ArticlePage(page);
    await articlePage.goto(article.slug);
    await articlePage.deleteArticle();

    await expect(page).toHaveURL('/');

    const verifyRes = await request.get(
      `${API_URL}/api/articles/${article.slug}`
    );
    expect(verifyRes.status()).toBe(404);
  });
});
