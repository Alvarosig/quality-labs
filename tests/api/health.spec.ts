import { test, expect } from '@playwright/test';

test.describe('API Health Check', () => {
  test('GET /api/tags returns list of tags', async ({ request }) => {
    const response = await request.get('/api/tags');

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('tags');
    expect(body.tags).toBeInstanceOf(Array);
    expect(body.tags.length).toBeGreaterThan(0);
  });

  test('GET /api/articles returns paginated articles', async ({ request }) => {
    const response = await request.get('/api/articles', {
      params: { limit: 5, offset: 0 },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('articles');
    expect(body).toHaveProperty('articlesCount');
    expect(body.articles).toBeInstanceOf(Array);
    expect(body.articles.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/articles/:slug returns single article', async ({
    request,
  }) => {
    // First get an article slug from the list
    const listResponse = await request.get('/api/articles', {
      params: { limit: 1 },
    });
    const { articles } = await listResponse.json();
    const slug = articles[0].slug;

    // Then fetch that specific article
    const response = await request.get(`/api/articles/${slug}`);

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.article).toHaveProperty('slug', slug);
    expect(body.article).toHaveProperty('title');
    expect(body.article).toHaveProperty('body');
    expect(body.article).toHaveProperty('author');
  });
});
