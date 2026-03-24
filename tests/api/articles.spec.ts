import { test, expect } from '@playwright/test';
import { authHeaders, createUser } from './helpers';

test.describe('Articles CRUD API', () => {
  let token: string;
  const timestamp = Date.now();

  test('POST /api/articles creates a new article', async ({ request }) => {
    ({ token } = await createUser(request, 'art'));

    const articleData = {
      article: {
        title: `Test Article ${timestamp}`,
        description: 'A test article created by quality-labs',
        body: 'This is the body of the test article.',
        tagList: ['test', 'quality-labs'],
      },
    };

    const response = await request.post('/api/articles', {
      headers: authHeaders(token),
      data: articleData,
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.article.title).toBe(articleData.article.title);
    expect(body.article.description).toBe(articleData.article.description);
    expect(body.article.tagList.map((t: string) => t.toLowerCase())).toEqual(
      expect.arrayContaining(['test'])
    );
    expect(body.article).toHaveProperty('slug');
    expect(body.article.author).toHaveProperty('username');
  });

  test('full CRUD lifecycle: create, read, update, delete', async ({
    request,
  }) => {
    ({ token } = await createUser(request, 'art'));

    // CREATE
    const createResponse = await request.post('/api/articles', {
      headers: authHeaders(token),
      data: {
        article: {
          title: `CRUD Test ${timestamp}`,
          description: 'Will be updated then deleted',
          body: 'Original body content.',
          tagList: ['crud-test'],
        },
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const { article: created } = await createResponse.json();
    const slug = created.slug;

    // READ
    const readResponse = await request.get(`/api/articles/${slug}`);
    expect(readResponse.ok()).toBeTruthy();
    const { article: read } = await readResponse.json();
    expect(read.title).toBe(created.title);

    // UPDATE
    const updateResponse = await request.put(`/api/articles/${slug}`, {
      headers: authHeaders(token),
      data: {
        article: {
          title: `Updated CRUD Test ${timestamp}`,
          body: 'Updated body content.',
        },
      },
    });
    expect(updateResponse.ok()).toBeTruthy();
    const { article: updated } = await updateResponse.json();
    expect(updated.body).toBe('Updated body content.');

    // DELETE
    const deleteResponse = await request.delete(`/api/articles/${slug}`, {
      headers: authHeaders(token),
    });
    expect([200, 204, 404].includes(deleteResponse.status())).toBeTruthy();

    // VERIFY DELETED — article should no longer be accessible
    const verifyResponse = await request.get(`/api/articles/${slug}`);
    expect(verifyResponse.status()).toBe(404);
  });

  test('POST /api/articles returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/articles', {
      data: {
        article: {
          title: 'Unauthorized',
          description: 'Should fail',
          body: 'No token provided',
        },
      },
    });

    expect(response.status()).toBe(401);
  });

  test('GET /api/articles supports filtering by tag', async ({ request }) => {
    const response = await request.get('/api/articles', {
      params: { tag: 'test', limit: 5 },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.articles).toBeInstanceOf(Array);
  });

  test('GET /api/articles supports filtering by author', async ({
    request,
  }) => {
    const response = await request.get('/api/articles', {
      params: { author: 'Artem Bondar', limit: 5 },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    body.articles.forEach((article: any) => {
      expect(article.author.username).toBe('Artem Bondar');
    });
  });
});
