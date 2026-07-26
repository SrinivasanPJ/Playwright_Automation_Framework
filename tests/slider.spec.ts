import { test, expect } from '../src/fixtures/test-fixtures';
import { SeleniumPlaygroundPage } from '../src/pages/selenium-playground.page';
import { SliderPage } from '../src/pages/slider.page';

test('Scenario 2 - Drag the slider from default value 15 to 95', async ({
  page,
}) => {
  const playground = new SeleniumPlaygroundPage(page);
  const sliderPage = new SliderPage(page);

  await test.step('Open Selenium Playground and select Drag & Drop Sliders', async () => {
    await playground.open();
    await playground.openDragAndDropSliders();
    await expect(page).toHaveURL(/drag-drop-range-sliders-demo/);
  });

  await test.step('Drag the slider with default value 15 to 95', async () => {
    await expect(sliderPage.sliderWithDefaultValue15).toHaveValue('15');
    await sliderPage.dragSliderTo(95);
  });

  await test.step('Validate that the range value shows 95', async () => {
    await expect(sliderPage.sliderWithDefaultValue15).toHaveValue('95');
    await expect(sliderPage.sliderValueOutput).toHaveText('95');
  });
});
