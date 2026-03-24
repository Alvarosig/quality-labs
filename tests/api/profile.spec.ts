import { test, expect } from '@playwright/test';
import { authHeaders, createUser } from './helpers';

test.describe('User Profile API', () => {
  test('PUT /api/user updates username', async ({ request }) => {
    const user = await createUser(request, 'prf');
    const newUsername = `updated-${Date.now()}`.slice(0, 20);

    const response = await request.put('/api/user', {
      headers: authHeaders(user.token),
      data: { user: { username: newUsername } },
    });

    expect(response.ok()).toBeTruthy();
    const { user: updated } = await response.json();
    expect(updated.username).toBe(newUsername);
  });

  test('PUT /api/user updates bio and image', async ({ request }) => {
    const user = await createUser(request, 'prf');

    const response = await request.put('/api/user', {
      headers: authHeaders(user.token),
      data: {
        user: {
          bio: 'QA Engineer building quality systems',
          image: 'https://example.com/avatar.png',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const { user: updated } = await response.json();
    expect(updated.bio).toBe('QA Engineer building quality systems');
    expect(updated.image).toBe('https://example.com/avatar.png');
  });

  test('PUT /api/user updates email', async ({ request }) => {
    const user = await createUser(request, 'prf');
    const newEmail = `updated-${Date.now()}@quality-labs.com`;

    const response = await request.put('/api/user', {
      headers: authHeaders(user.token),
      data: { user: { email: newEmail } },
    });

    expect(response.ok()).toBeTruthy();
    const { user: updated } = await response.json();
    expect(updated.email).toBe(newEmail);
  });

  test('PUT /api/user returns updated token', async ({ request }) => {
    const user = await createUser(request, 'prf');

    const response = await request.put('/api/user', {
      headers: authHeaders(user.token),
      data: { user: { bio: 'New bio' } },
    });

    expect(response.ok()).toBeTruthy();
    const { user: updated } = await response.json();
    expect(updated).toHaveProperty('token');
  });

  test('PUT /api/user persists changes on GET /api/user', async ({
    request,
  }) => {
    const user = await createUser(request, 'prf');
    const newBio = 'Persisted bio change';

    await request.put('/api/user', {
      headers: authHeaders(user.token),
      data: { user: { bio: newBio } },
    });

    const response = await request.get('/api/user', {
      headers: authHeaders(user.token),
    });

    expect(response.ok()).toBeTruthy();
    const { user: fetched } = await response.json();
    expect(fetched.bio).toBe(newBio);
  });

  test('PUT /api/user returns 401 without auth', async ({ request }) => {
    const response = await request.put('/api/user', {
      data: { user: { bio: 'Should fail' } },
    });

    expect(response.status()).toBe(401);
  });
});
