import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'playwright/test';
import { World } from '../support/world';

// --- Navigation steps ---

Given('I am on the sign up page', async function (this: World) {
  await this.page.goto('/register');
});

Given('I am on the sign in page', async function (this: World) {
  await this.page.goto('/login');
});

// --- Data setup steps ---

Given(
  'a user exists with email {string} and password {string}',
  async function (this: World, _email: string, password: string) {
    const uid = Date.now();
    const username = `qa-bdd-${uid}`.slice(0, 20);
    const uniqueEmail = `bdd-${uid}@quality-labs.com`;

    await this.createUserViaApi(uniqueEmail, password, username);

    this.testData.username = username;
    this.testData.email = uniqueEmail;
    this.testData.password = password;
  },
);

// --- Action steps ---

When('I register with valid credentials', async function (this: World) {
  const uid = Date.now();
  const username = `qa-bdd-${uid}`;

  await this.page.getByPlaceholder('Username').fill(username);
  await this.page.getByPlaceholder('Email').fill(`${username}@quality-labs.com`);
  await this.page.getByPlaceholder('Password').fill('SecurePass123!');
  await this.page.getByRole('button', { name: 'Sign up' }).click();

  this.testData.username = username;
});

When(
  'I sign in with email {string} and password {string}',
  async function (this: World, email: string, password: string) {
    const actualEmail = this.testData.email || email;
    const actualPassword = this.testData.password || password;

    await this.page.getByPlaceholder('Email').fill(actualEmail);
    await this.page.getByPlaceholder('Password').fill(actualPassword);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  },
);

// --- Assertion steps ---

Then('I should be redirected to the home page', async function (this: World) {
  await expect(this.page).toHaveURL('/');
});

Then('I should see my username in the navigation', async function (this: World) {
  await expect(this.page.getByText(this.testData.username)).toBeVisible();
});

Then('I should see an error message', async function (this: World) {
  await expect(this.page.locator('.error-messages')).toBeVisible();
});
