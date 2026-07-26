import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class SeleniumPlaygroundPage extends BasePage {
  private static readonly URL =
    'https://www.testmuai.com/selenium-playground/';

  private readonly simpleFormDemoLink: Locator;
  private readonly dragAndDropSlidersLink: Locator;
  private readonly inputFormSubmitLink: Locator;

  constructor(page: Page) {
    super(page);

    this.simpleFormDemoLink = page.getByRole('link', {
      name: 'Simple Form Demo',
      exact: true,
    });

    this.dragAndDropSlidersLink = page.getByRole('link', {
      name: 'Drag & Drop Sliders',
      exact: true,
    });

    this.inputFormSubmitLink = page.getByRole('link', {
      name: 'Input Form Submit',
      exact: true,
    });
  }

  async open(): Promise<void> {
    await this.page.goto(SeleniumPlaygroundPage.URL, {
      waitUntil: 'domcontentloaded',
    });

    await this.dismissCookieBannerIfPresent();

    await this.simpleFormDemoLink.waitFor({
      state: 'visible',
      timeout: 20_000,
    });
  }

  async openSimpleFormDemo(): Promise<void> {
    await this.simpleFormDemoLink.scrollIntoViewIfNeeded();
    await this.simpleFormDemoLink.click();

    await this.waitForPlaygroundPath('/selenium-playground/simple-form-demo/');
  }

  async openDragAndDropSliders(): Promise<void> {
    await this.dragAndDropSlidersLink.scrollIntoViewIfNeeded();
    await this.dragAndDropSlidersLink.click();

    await this.waitForPlaygroundPath(
      '/selenium-playground/drag-drop-range-sliders-demo/',
    );
  }

  async openInputFormSubmit(): Promise<void> {
    await this.inputFormSubmitLink.scrollIntoViewIfNeeded();
    await this.inputFormSubmitLink.click();

    await this.waitForPlaygroundPath('/selenium-playground/input-form-demo/');
  }

  /**
   * Waits for the expected page pathname while intentionally ignoring
   * query parameters.
   *
   * TestMu AI may append tracking parameters such as:
   * ?_gl=...
   *
   * Those parameters should not cause navigation validation to fail.
   */
  private async waitForPlaygroundPath(
    expectedPathname: string,
  ): Promise<void> {
    const normalizePath = (pathname: string): string =>
      pathname.endsWith('/') ? pathname : `${pathname}/`;

    await this.page.waitForURL(
      (url) =>
        normalizePath(url.pathname) ===
        normalizePath(expectedPathname),
      {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      },
    );
  }
}