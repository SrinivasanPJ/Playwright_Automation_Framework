import { expect, test } from '../src/fixtures/test-fixtures';
import { InputFormPage } from '../src/pages/input-form.page';
import { SeleniumPlaygroundPage } from '../src/pages/selenium-playground.page';
import { validContactFormData } from '../src/test-data/contact-form.data';

test(
  'Scenario 3 - Validate the empty form and submit completed contact details',
  async ({ page }) => {
    const playground = new SeleniumPlaygroundPage(page);
    const inputForm = new InputFormPage(page);

    await test.step(
      'Open Selenium Playground and click Input Form Submit',
      async () => {
        await playground.open();
        await playground.openInputFormSubmit();
        await inputForm.waitForLoaded();

        await expect(
          page,
          'The browser should navigate to the Input Form Demo page',
        ).toHaveURL(/input-form-demo/);
      },
    );

    await test.step(
      'Submit the empty form and validate required-field handling',
      async () => {
        const validationMessage =
          await inputForm.submitEmptyFormAndReadValidationMessage();

        /*
         * Chrome normally returns:
         * "Please fill out this field."
         *
         * Other browsers can use slightly different wording. The assignment
         * describes the expected behavior as "Please fill in the fields".
         */
        expect(
          validationMessage,
          'A required-field validation message should be displayed',
        ).toMatch(/please fill/i);

        await expect(
          inputForm.nameInput,
          'The first required field should receive focus',
        ).toBeFocused();
      },
    );

    await test.step(
      'Fill all required form fields',
      async () => {
        await inputForm.fillForm(validContactFormData);

        await expect(inputForm.nameInput).toHaveValue(
          validContactFormData.name,
        );

        await expect(inputForm.emailInput).toHaveValue(
          validContactFormData.email,
        );

        await expect(inputForm.passwordInput).toHaveValue(
          validContactFormData.password,
        );

        await expect(inputForm.companyInput).toHaveValue(
          validContactFormData.company,
        );

        await expect(inputForm.websiteInput).toHaveValue(
          validContactFormData.website,
        );

        await expect(inputForm.cityInput).toHaveValue(
          validContactFormData.city,
        );

        await expect(inputForm.addressLine1Input).toHaveValue(
          validContactFormData.addressLine1,
        );

        await expect(inputForm.addressLine2Input).toHaveValue(
          validContactFormData.addressLine2,
        );

        await expect(inputForm.stateInput).toHaveValue(
          validContactFormData.state,
        );

        await expect(inputForm.zipCodeInput).toHaveValue(
          validContactFormData.zipCode,
        );
      },
    );

    await test.step(
      'Validate United States was selected by visible text',
      async () => {
        await expect(
          inputForm.countrySelect.locator('option:checked'),
          'The selected country should be United States',
        ).toHaveText('United States');
      },
    );

    await test.step(
      'Submit the completed form',
      async () => {
        await inputForm.submitCompletedForm();
      },
    );

    await test.step(
      'Validate the successful submission message',
      async () => {
        await expect(
          inputForm.successMessage,
          'The contact-form success message should become visible',
        ).toBeVisible({
          timeout: 15_000,
        });

        await expect(inputForm.successMessage).toHaveText(
          'Thanks for contacting us, we will get back to you shortly.',
        );
      },
    );
  },
);