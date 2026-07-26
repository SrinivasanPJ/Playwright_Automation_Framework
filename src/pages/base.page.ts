import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /**
   * Closes a supported cookie-consent banner only when a matching
   * visible button exists.
   *
   * The banner is optional, so its absence must not fail or delay a test.
   */
  protected async dismissCookieBannerIfPresent(): Promise<void> {
    const cookieButtons: Locator[] = [
      this.page.getByRole('button', {
        name: /accept all/i,
      }),
      this.page.getByRole('button', {
        name: /^accept$/i,
      }),
      this.page.getByRole('button', {
        name: /allow all/i,
      }),
    ];

    for (const cookieButton of cookieButtons) {
      const candidate = cookieButton.first();

      if (await candidate.isVisible()) {
        await candidate.click();
        return;
      }
    }
  }
}