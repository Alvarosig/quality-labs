import { APIRequestContext } from '@playwright/test';

export function authHeaders(token: string) {
  return { Authorization: `Token ${token}` };
}

export async function createUser(
  request: APIRequestContext,
  prefix = 'test'
): Promise<{ token: string; username: string; email: string }> {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `${prefix}-${uid}@quality-labs.com`;
  const username = `qa-${prefix}-${uid}`.slice(0, 20);

  const res = await request.post('/api/users', {
    data: {
      user: { email, password: 'SecurePass123!', username },
    },
  });

  const { user } = await res.json();
  return { token: user.token, username: user.username, email: user.email };
}

export async function createArticle(
  request: APIRequestContext,
  token: string
): Promise<string> {
  const uid = Date.now();
  const res = await request.post('/api/articles', {
    headers: authHeaders(token),
    data: {
      article: {
        title: `Test Article ${uid}`,
        description: 'Article created by helper',
        body: 'Helper-generated content.',
      },
    },
  });

  const { article } = await res.json();
  return article.slug;
}
