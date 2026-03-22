import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `testuser-${timestamp}@quality-labs.com`,
    password: 'SecurePass123!',
    username: `qa-${timestamp}`,
  };

  test('POST /api/users registers a new user', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: { user: testUser },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.user).toHaveProperty('token');
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.username).toBe(testUser.username);
  });

  test('POST /api/users/login authenticates existing user', async ({
    request,
  }) => {
    await request.post('/api/users', {
      data: { user: testUser },
    });

    const response = await request.post('/api/users/login', {
      data: {
        user: {
          email: testUser.email,
          password: testUser.password,
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.user).toHaveProperty('token');
    expect(body.user.email).toBe(testUser.email);
  });

  test('POST /api/users/login rejects invalid credentials', async ({
    request,
  }) => {
    const response = await request.post('/api/users/login', {
      data: {
        user: {
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        },
      },
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(403);
  });

  test('GET /api/user returns current user with valid token', async ({
    request,
  }) => {
    // Register a unique user for this test
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const freshUser = {
      email: `current-${uid}@quality-labs.com`,
      password: 'SecurePass123!',
      username: `qa-cur-${uid}`.slice(0, 20),
    };

    const registerResponse = await request.post('/api/users', {
      data: { user: freshUser },
    });
    expect(registerResponse.status()).toBe(201);
    const { user } = await registerResponse.json();

    // Fetch current user with token
    const response = await request.get('/api/user', {
      headers: {
        Authorization: `Token ${user.token}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.user.email).toBe(freshUser.email);
  });

  test('GET /api/user returns 401 without token', async ({ request }) => {
    const response = await request.get('/api/user');

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test('POST /api/users rejects duplicate email', async ({ request }) => {
    await request.post('/api/users', {
      data: { user: testUser },
    });

    // Try to register again with same email
    const response = await request.post('/api/users', {
      data: { user: testUser },
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(422);
  });
});
