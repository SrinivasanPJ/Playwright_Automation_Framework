import type { Locator, Page } from '@playwright/test';
import type { ContactFormData } from '../test-data/contact-form.data';
import { BasePage } from './base.page';

export class InputFormPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly companyInput: Locator;
  readonly websiteInput: Locator;
  readonly countrySelect: Locator;
  readonly cityInput: Locator;
  readonly addressLine1Input: Locator;
  readonly addressLine2Input: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Locator strategy 3: placeholder locators.
    this.nameInput = page.getByPlaceholder('Name', {
      exact: true,
    });

    this.emailInput = page.getByPlaceholder('Email', {
      exact: true,
    });

    this.passwordInput = page.getByPlaceholder('Password', {
      exact: true,
    });

    this.companyInput = page.getByPlaceholder('Company', {
      exact: true,
    });

    this.websiteInput = page.getByPlaceholder('Website', {
      exact: true,
    });

    /*
     * The Country field is a select element and does not have a reliable
     * placeholder locator. The DOM shows name="country".
     */
    this.countrySelect = page.locator('select[name="country"]');

    this.cityInput = page.getByPlaceholder('City', {
      exact: true,
    });

    this.addressLine1Input = page.getByPlaceholder('Address 1', {
      exact: true,
    });

    this.addressLine2Input = page.getByPlaceholder('Address 2', {
      exact: true,
    });

    this.stateInput = page.getByPlaceholder('State', {
      exact: true,
    });

    this.zipCodeInput = page.getByPlaceholder('Zip code', {
      exact: true,
    });

    this.submitButton = page.getByRole('button', {
      name: 'Submit',
      exact: true,
    });

    // Locator strategy 4: visible-text locator.
    this.successMessage = page.getByText(
      'Thanks for contacting us, we will get back to you shortly.',
      {
        exact: true,
      },
    );
  }

  async waitForLoaded(): Promise<void> {
    await this.nameInput.waitFor({
      state: 'visible',
      timeout: 15_000,
    });

    await this.submitButton.waitFor({
      state: 'visible',
      timeout: 15_000,
    });
  }

  async submitEmptyFormAndReadValidationMessage(): Promise<string> {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();

    /*
     * The current TestMu AI form uses native HTML5 required-field
     * validation. Chrome and Edge may display slightly different text.
     */
    const validationResult = await this.nameInput.evaluate(
      (element: HTMLInputElement) => ({
        isValid: element.validity.valid,
        validationMessage: element.validationMessage.trim(),
      }),
    );

    if (validationResult.isValid) {
      throw new Error(
        'The Name field was expected to be invalid after submitting the empty form.',
      );
    }

    if (!validationResult.validationMessage) {
      throw new Error(
        'The browser did not return a required-field validation message.',
      );
    }

    return validationResult.validationMessage;
  }

  async fillForm(data: ContactFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.companyInput.fill(data.company);
    await this.websiteInput.fill(data.website);

    /*
     * The assignment specifically requires selecting United States using
     * the displayed option text.
     */
    await this.countrySelect.selectOption({
      label: data.country,
    });

    await this.cityInput.fill(data.city);
    await this.addressLine1Input.fill(data.addressLine1);
    await this.addressLine2Input.fill(data.addressLine2);
    await this.stateInput.fill(data.state);
    await this.zipCodeInput.fill(data.zipCode);
  }

  /**
   * Returns all required controls that are still invalid.
   *
   * This produces a useful failure message instead of only reporting that
   * the success message remained hidden.
   */
  async getInvalidRequiredFields(): Promise<string[]> {
    return this.page
      .locator('#seleniumform input[required], #seleniumform select[required]')
      .evaluateAll((elements) => {
        const controls = elements as Array<
          HTMLInputElement | HTMLSelectElement
        >;

        return controls
          .filter((control) => !control.checkValidity())
          .map((control) => {
            const fieldName =
              control.name ||
              control.id ||
              control.getAttribute('placeholder') ||
              'unknown-field';

            return `${fieldName}: ${control.validationMessage}`;
          });
      });
  }

  async submitCompletedForm(): Promise<void> {
    const invalidFields = await this.getInvalidRequiredFields();

    if (invalidFields.length > 0) {
      throw new Error(
        `The form still contains invalid fields:\n${invalidFields.join('\n')}`,
      );
    }

    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
  }
}