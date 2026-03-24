import { Page, Locator } from '@playwright/test';

export class ArticlePage {
  readonly page: Page;
  readonly title: Locator;
  readonly body: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly tagList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.body = page.locator('.article-content');
    this.editButton = page.getByRole('link', { name: 'Edit Article' }).first();
    this.deleteButton = page
      .getByRole('button', { name: 'Delete Article' })
      .first();
    this.tagList = page.locator('.tag-list');
  }

  async goto(slug: string) {
    await this.page.goto(`/article/${slug}`);
  }

  async deleteArticle() {
    await this.deleteButton.click();
    await this.page.waitForURL('/');
  }
}
