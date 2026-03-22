import { Page, Locator } from '@playwright/test';

export class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessages = page.locator('.error-messages');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
