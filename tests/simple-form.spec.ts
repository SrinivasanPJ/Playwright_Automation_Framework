import {
  expect,
  test,
} from '../src/fixtures/test-fixtures';

import { SeleniumPlaygroundPage } from '../src/pages/selenium-playground.page';
import { SimpleFormPage } from '../src/pages/simple-form.page';

test(
  'Scenario 1 - Simple Form Demo displays the entered message',
  async ({ page }) => {
    const playgroundPage =
      new SeleniumPlaygroundPage(page);

    const simpleFormPage =
      new SimpleFormPage(page);

    const expectedMessage =
      'Welcome to TestMu AI';

    await test.step(
      'Open Selenium Playground and click Simple Form Demo',
      async () => {
        await playgroundPage.open();

        await playgroundPage.openSimpleFormDemo();

        /*
         * This waits not only for visibility but also for React hydration.
         */
        await simpleFormPage.waitForLoaded();
      },
    );

    await test.step(
      'Validate the URL contains simple-form-demo',
      async () => {
        await expect(
          page,
          'The browser should navigate to the Simple Form Demo page',
        ).toHaveURL(/simple-form-demo/);
      },
    );

    await test.step(
      'Enter the message in the Enter Message textbox',
      async () => {
        await simpleFormPage.enterMessage(
          expectedMessage,
        );

        await expect(
          simpleFormPage.messageInput,
          'The input should contain the complete entered message',
        ).toHaveValue(expectedMessage);
      },
    );

    await test.step(
      'Click Get Checked Value',
      async () => {
        await simpleFormPage.clickGetCheckedValue();
      },
    );

    await test.step(
      'Validate the displayed Your Message value',
      async () => {
        /*
         * Validate the business result first.
         *
         * toHaveText retries until the expected text is present or the
         * configured assertion timeout expires.
         */
        await expect(
          simpleFormPage.displayedMessage,
          'The displayed message should match the entered message',
        ).toHaveText(expectedMessage, {
          timeout: 15_000,
        });

        /*
         * Once the paragraph contains text, confirm it is visibly rendered.
         */
        await expect(
          simpleFormPage.displayedMessage,
          'The message should be visible under Your Message',
        ).toBeVisible();
      },
    );
  },
);