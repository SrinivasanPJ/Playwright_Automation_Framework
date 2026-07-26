import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SimpleFormPage extends BasePage {
  readonly messageInput: Locator;
  readonly getCheckedValueButton: Locator;
  readonly displayedMessage: Locator;

  constructor(page: Page) {
    super(page);

    /*
     * The page contains duplicate id="user-message" elements.
     *
     * Restrict the selector to the actual input element and its
     * unique placeholder.
     */
    this.messageInput = page.locator(
      'input#user-message[placeholder="Please enter your Message"]',
    );

    /*
     * The DOM screenshot confirms that the button has id="showInput".
     */
    this.getCheckedValueButton = page.locator(
      'button#showInput',
    );

    /*
     * The displayed result is:
     *
     * <p id="message" class="mt-20">...</p>
     */
    this.displayedMessage = page.locator('p#message');
  }

  /**
   * Waits until the page is loaded and the React application has hydrated.
   *
   * Merely waiting for the input to become visible is insufficient because
   * the server-rendered HTML can appear before React event bindings and
   * application state are ready.
   */
  async waitForLoaded(): Promise<void> {
    await this.page.waitForLoadState('load');

    await this.messageInput.waitFor({
      state: 'visible',
      timeout: 15_000,
    });

    await this.getCheckedValueButton.waitFor({
      state: 'visible',
      timeout: 15_000,
    });

    /*
     * React attaches internal properties such as __reactFiber$... and
     * __reactProps$... when hydration is complete.
     *
     * Waiting for these properties prevents us from entering text before
     * the React onChange and onClick handlers are ready.
     */
    await this.page.waitForFunction(
      () => {
        const input = document.querySelector<HTMLInputElement>(
          'input#user-message[placeholder="Please enter your Message"]',
        );

        const button = document.querySelector<HTMLButtonElement>(
          'button#showInput',
        );

        if (!input || !button) {
          return false;
        }

        const hasReactBinding = (element: Element): boolean =>
          Object.getOwnPropertyNames(element).some(
            (propertyName) =>
              propertyName.startsWith('__reactFiber$') ||
              propertyName.startsWith('__reactProps$'),
          );

        return (
          hasReactBinding(input) &&
          hasReactBinding(button)
        );
      },
      undefined,
      {
        timeout: 15_000,
      },
    );
  }

  /**
   * Enters the message using real keyboard events.
   *
   * pressSequentially sends keydown, keypress/input, and keyup events for
   * each character, making the interaction behave like real user typing.
   */
  async enterMessage(message: string): Promise<void> {
    await this.messageInput.click();

    /*
     * Clear any existing text before typing.
     */
    await this.messageInput.fill('');

    await this.messageInput.pressSequentially(message, {
      delay: 20,
    });
  }

  async clickGetCheckedValue(): Promise<void> {
    await this.getCheckedValueButton.scrollIntoViewIfNeeded();

    await this.getCheckedValueButton.click();
  }
}