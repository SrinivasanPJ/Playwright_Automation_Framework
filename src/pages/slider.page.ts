import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SliderPage extends BasePage {
  readonly sliderWithDefaultValue15: Locator;
  readonly sliderValueOutput: Locator;

  constructor(page: Page) {
    super(page);

    this.sliderWithDefaultValue15 = page.locator(
      'input[type="range"][value="15"]',
    );

    // The output element is the first sibling following the selected range input.
    this.sliderValueOutput = this.sliderWithDefaultValue15.locator(
      'xpath=following-sibling::output[1]',
    );
  }

  /**
   * Performs a real mouse drag first, then makes a small keyboard correction
   * only when browser-specific range rounding does not land exactly on target.
   */
  async dragSliderTo(targetValue: number): Promise<void> {
    const slider = this.sliderWithDefaultValue15;
    await slider.scrollIntoViewIfNeeded();

    const { min, max, current } = await slider.evaluate(
      (element: HTMLInputElement) => ({
        min: Number(element.min || 0),
        max: Number(element.max || 100),
        current: Number(element.value),
      }),
    );

    if (targetValue < min || targetValue > max) {
      throw new Error(
        `Target slider value ${targetValue} is outside the range ${min}-${max}.`,
      );
    }

    const box = await slider.boundingBox();
    if (!box) {
      throw new Error('The slider does not have a visible bounding box.');
    }

    const valueRange = max - min;
    const startRatio = (current - min) / valueRange;
    const targetRatio = (targetValue - min) / valueRange;
    const y = box.y + box.height / 2;

    await this.page.mouse.move(box.x + box.width * startRatio, y);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width * targetRatio, y, {
      steps: 20,
    });
    await this.page.mouse.up();

    // Different browser engines can round a pixel drag by one or two values.
    // Correct only that remainder while preserving the required drag action.
    await slider.focus();
    let actualValue = Number(await slider.inputValue());
    const correctionKey = actualValue < targetValue ? 'ArrowRight' : 'ArrowLeft';

    while (actualValue !== targetValue) {
      await slider.press(correctionKey);
      actualValue = Number(await slider.inputValue());
    }
  }
}
