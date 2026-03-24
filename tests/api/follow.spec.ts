import { test, expect } from '@playwright/test';
import { authHeaders, createUser } from './helpers';

test.describe('Follow/Unfollow API', () => {
  test('GET /api/profiles/:username returns profile', async ({ request }) => {
    const user = await createUser(request, 'flw');

    const response = await request.get(`/api/profiles/${user.username}`);

    expect(response.ok()).toBeTruthy();
    const { profile } = await response.json();
    expect(profile.username).toBe(user.username);
    expect(profile).toHaveProperty('bio');
    expect(profile).toHaveProperty('image');
    expect(profile).toHaveProperty('following');
  });

  test('POST /api/profiles/:username/follow follows a user', async ({
    request,
  }) => {
    const author = await createUser(request, 'flw-a');
    const follower = await createUser(request, 'flw-b');

    const response = await request.post(
      `/api/profiles/${author.username}/follow`,
      { headers: authHeaders(follower.token) }
    );

    expect(response.ok()).toBeTruthy();
    const { profile } = await response.json();
    expect(profile.username).toBe(author.username);
    expect(profile.following).toBe(true);
  });

  test('DELETE /api/profiles/:username/follow unfollows a user', async ({
    request,
  }) => {
    const author = await createUser(request, 'flw-a');
    const follower = await createUser(request, 'flw-b');

    await request.post(`/api/profiles/${author.username}/follow`, {
      headers: authHeaders(follower.token),
    });

    const response = await request.delete(
      `/api/profiles/${author.username}/follow`,
      { headers: authHeaders(follower.token) }
    );

    expect(response.ok()).toBeTruthy();
    const { profile } = await response.json();
    expect(profile.following).toBe(false);
  });

  test('following state is reflected on GET /api/profiles/:username', async ({
    request,
  }) => {
    const author = await createUser(request, 'flw-a');
    const follower = await createUser(request, 'flw-b');

    const before = await request.get(`/api/profiles/${author.username}`, {
      headers: authHeaders(follower.token),
    });
    expect((await before.json()).profile.following).toBe(false);

    await request.post(`/api/profiles/${author.username}/follow`, {
      headers: authHeaders(follower.token),
    });

    const after = await request.get(`/api/profiles/${author.username}`, {
      headers: authHeaders(follower.token),
    });
    expect((await after.json()).profile.following).toBe(true);
  });

  test('following is user-specific — other users see their own state', async ({
    request,
  }) => {
    const author = await createUser(request, 'flw-a');
    const follower = await createUser(request, 'flw-b');
    const stranger = await createUser(request, 'flw-c');

    // Only follower follows author
    await request.post(`/api/profiles/${author.username}/follow`, {
      headers: authHeaders(follower.token),
    });

    const followerView = await request.get(`/api/profiles/${author.username}`, {
      headers: authHeaders(follower.token),
    });
    const strangerView = await request.get(`/api/profiles/${author.username}`, {
      headers: authHeaders(stranger.token),
    });

    expect((await followerView.json()).profile.following).toBe(true);
    expect((await strangerView.json()).profile.following).toBe(false);
  });

  test('POST /api/profiles/:username/follow returns 401 without auth', async ({
    request,
  }) => {
    const author = await createUser(request, 'flw-a');

    const response = await request.post(
      `/api/profiles/${author.username}/follow`
    );

    expect(response.status()).toBe(401);
  });
});
