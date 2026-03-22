import {
  setWorldConstructor,
  World as CucumberWorld,
} from '@cucumber/cucumber';
import { Browser, Page, BrowserContext, APIRequestContext } from 'playwright';
import { chromium } from 'playwright';
import { API_URL, BASE_URL } from '../../config';

export class World extends CucumberWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  request!: APIRequestContext;

  testData: Record<string, string> = {};

  async openBrowser() {
    this.browser = await chromium.launch();
    this.context = await this.browser.newContext({ baseURL: BASE_URL });
    this.page = await this.context.newPage();
    this.request = this.context.request;
  }

  async closeBrowser() {
    await this.context?.close();
    await this.browser?.close();
  }

  async createUserViaApi(email: string, password: string, username: string) {
    const response = await this.request.post(`${API_URL}/api/users`, {
      data: {
        user: { email, password, username },
      },
    });
    return response.json();
  }
}

setWorldConstructor(World);
