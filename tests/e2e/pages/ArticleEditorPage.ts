import { Page, Locator } from '@playwright/test';

export class ArticleEditorPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagInput: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.tagInput = page.getByPlaceholder('Enter tags');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
  }

  async goto() {
    await this.page.goto('/editor');
  }

  async fillArticle(
    title: string,
    description: string,
    body: string,
    tags?: string[]
  ) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.bodyInput.fill(body);

    if (tags) {
      for (const tag of tags) {
        await this.tagInput.fill(tag);
        await this.tagInput.press('Enter');
      }
    }
  }

  async publish(): Promise<string> {
    await this.publishButton.click();

    await this.page.waitForURL(/\/article\//);

    const url = this.page.url();
    return url.split('/article/')[1];
  }
}
