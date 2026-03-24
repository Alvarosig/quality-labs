import { test, expect, APIRequestContext } from '@playwright/test';

test.describe('Comments API', () => {
  async function createUserAndArticle(request: APIRequestContext) {
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const userRes = await request.post('/api/users', {
      data: {
        user: {
          email: `comments-${uid}@quality-labs.com`,
          password: 'SecurePass123!',
          username: `qa-cmt-${uid}`.slice(0, 20),
        },
      },
    });
    const { user } = await userRes.json();

    const articleRes = await request.post('/api/articles', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          title: `Comment Test ${uid}`,
          description: 'Article for comment tests',
          body: 'Body content.',
        },
      },
    });
    const { article } = await articleRes.json();

    return { token: user.token, slug: article.slug, username: user.username };
  }

  function authHeaders(token: string) {
    return { Authorization: `Token ${token}` };
  }

  test('POST /api/articles/:slug/comments creates a comment', async ({
    request,
  }) => {
    const { token, slug } = await createUserAndArticle(request);

    const response = await request.post(`/api/articles/${slug}/comments`, {
      headers: authHeaders(token),
      data: {
        comment: { body: 'Great article! Very helpful.' },
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.comment).toHaveProperty('id');
    expect(body.comment.body).toBe('Great article! Very helpful.');
    expect(body.comment).toHaveProperty('author');
    expect(body.comment).toHaveProperty('createdAt');
  });

  test('GET /api/articles/:slug/comments returns all comments', async ({
    request,
  }) => {
    const { token, slug } = await createUserAndArticle(request);

    // Create 2 comments
    await request.post(`/api/articles/${slug}/comments`, {
      headers: authHeaders(token),
      data: { comment: { body: 'First comment' } },
    });
    await request.post(`/api/articles/${slug}/comments`, {
      headers: authHeaders(token),
      data: { comment: { body: 'Second comment' } },
    });

    const response = await request.get(`/api/articles/${slug}/comments`, {
      headers: authHeaders(token),
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.comments).toBeInstanceOf(Array);
    expect(body.comments.length).toBeGreaterThanOrEqual(2);

    const comment = body.comments[0];
    expect(comment).toHaveProperty('id');
    expect(comment).toHaveProperty('body');
    expect(comment).toHaveProperty('author');
    expect(comment).toHaveProperty('createdAt');
  });

  test('DELETE /api/articles/:slug/comments/:id removes a comment', async ({
    request,
  }) => {
    const { token, slug } = await createUserAndArticle(request);

    const createRes = await request.post(`/api/articles/${slug}/comments`, {
      headers: authHeaders(token),
      data: { comment: { body: 'Will be deleted' } },
    });
    const { comment } = await createRes.json();

    const deleteRes = await request.delete(
      `/api/articles/${slug}/comments/${comment.id}`,
      { headers: authHeaders(token) },
    );
    expect(deleteRes.ok()).toBeTruthy();

    const listRes = await request.get(`/api/articles/${slug}/comments`);
    const body = await listRes.json();
    const ids = body.comments.map((c: any) => c.id);
    expect(ids).not.toContain(comment.id);
  });

  test('POST /api/articles/:slug/comments returns 401 without auth', async ({
    request,
  }) => {
    const { slug } = await createUserAndArticle(request);

    const response = await request.post(`/api/articles/${slug}/comments`, {
      data: { comment: { body: 'Unauthorized comment' } },
    });

    expect(response.status()).toBe(401);
  });

  test('cannot delete another user\'s comment', async ({ request }) => {
    const { token: authorToken, slug } = await createUserAndArticle(request);

    // Author creates a comment
    const createRes = await request.post(`/api/articles/${slug}/comments`, {
      headers: authHeaders(authorToken),
      data: { comment: { body: 'Author comment' } },
    });
    const { comment } = await createRes.json();

    // Create a different user
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const otherRes = await request.post('/api/users', {
      data: {
        user: {
          email: `other-${uid}@quality-labs.com`,
          password: 'SecurePass123!',
          username: `qa-other-${uid}`.slice(0, 20),
        },
      },
    });
    const { user: otherUser } = await otherRes.json();

    // Other user tries to delete author's comment
    const deleteRes = await request.delete(
      `/api/articles/${slug}/comments/${comment.id}`,
      { headers: authHeaders(otherUser.token) },
    );

    expect(deleteRes.ok()).toBeFalsy();
  });
});
