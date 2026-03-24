import { test, expect } from '@playwright/test';
import { authHeaders, createUser, createArticle } from './helpers';

test.describe('Favorites API', () => {
  test('POST /api/articles/:slug/favorite marks article as favorited', async ({
    request,
  }) => {
    const author = await createUser(request);
    const slug = await createArticle(request, author.token);

    // A different user favorites the article
    const reader = await createUser(request);

    const response = await request.post(`/api/articles/${slug}/favorite`, {
      headers: authHeaders(reader.token),
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.article.favorited).toBe(true);
    expect(body.article.favoritesCount).toBe(1);
  });

  test('DELETE /api/articles/:slug/favorite removes favorite', async ({
    request,
  }) => {
    const author = await createUser(request);
    const slug = await createArticle(request, author.token);
    const reader = await createUser(request);

    // Favorite first
    await request.post(`/api/articles/${slug}/favorite`, {
      headers: authHeaders(reader.token),
    });

    // Then unfavorite
    const response = await request.delete(`/api/articles/${slug}/favorite`, {
      headers: authHeaders(reader.token),
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.article.favorited).toBe(false);
    expect(body.article.favoritesCount).toBe(0);
  });

  test('favorite count reflects multiple users', async ({ request }) => {
    const author = await createUser(request);
    const slug = await createArticle(request, author.token);

    // 3 different users favorite the same article
    const reader1 = await createUser(request);
    const reader2 = await createUser(request);
    const reader3 = await createUser(request);

    await request.post(`/api/articles/${slug}/favorite`, {
      headers: authHeaders(reader1.token),
    });
    await request.post(`/api/articles/${slug}/favorite`, {
      headers: authHeaders(reader2.token),
    });
    const response = await request.post(`/api/articles/${slug}/favorite`, {
      headers: authHeaders(reader3.token),
    });

    const body = await response.json();
    expect(body.article.favoritesCount).toBe(3);
  });

  test('favorited state persists on GET', async ({ request }) => {
    const author = await createUser(request);
    const slug = await createArticle(request, author.token);
    const reader = await createUser(request);

    // Favorite
    await request.post(`/api/articles/${slug}/favorite`, {
      headers: authHeaders(reader.token),
    });

    // Fetch article as the reader — should show favorited: true
    const response = await request.get(`/api/articles/${slug}`, {
      headers: authHeaders(reader.token),
    });

    const body = await response.json();
    expect(body.article.favorited).toBe(true);
    expect(body.article.favoritesCount).toBe(1);

    // Fetch as author — should show favorited: false (they didn't favorite it)
    const authorResponse = await request.get(`/api/articles/${slug}`, {
      headers: authHeaders(author.token),
    });

    const authorBody = await authorResponse.json();
    expect(authorBody.article.favorited).toBe(false);
    expect(authorBody.article.favoritesCount).toBe(1); // count same, but not favorited by this user
  });

  test('POST /api/articles/:slug/favorite returns 401 without auth', async ({
    request,
  }) => {
    const author = await createUser(request);
    const slug = await createArticle(request, author.token);

    const response = await request.post(`/api/articles/${slug}/favorite`);

    expect(response.status()).toBe(401);
  });
});
