import { test, expect } from '@playwright/test';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { API_URL } from '../config';

test.describe('Sign Up', () => {
  test('should register a new user', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const uid = Date.now();
    const username = `qa-${uid}`;

    await signUpPage.goto();

    await signUpPage.register(
      username,
      `${username}@quality-labs.com`,
      'SecurePass123!'
    );

    await expect(page).toHaveURL('/');
    await expect(page.getByText(username)).toBeVisible();
  });
});

// pattern: "set up via API, test via UI"
test.describe('Sign In', () => {
  test('should login with valid credentials', async ({ page, request }) => {
    const signInPage = new SignInPage(page);
    const uid = Date.now();
    const email = `login-${uid}@quality-labs.com`;
    const password = 'SecurePass123!';
    const username = `qa-login-${uid}`.slice(0, 20);

    await request.post(`${API_URL}/api/users`, {
      data: {
        user: { email, password, username },
      },
    });

    await signInPage.goto();
    await signInPage.login(email, password);

    await expect(page).toHaveURL('/');
    await expect(page.getByText(username)).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();

    await signInPage.login('nonexistent@test.com', 'wrongpassword');

    await expect(signInPage.errorMessages).toBeVisible();
  });
});
