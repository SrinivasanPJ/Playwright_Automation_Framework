import 'dotenv/config';

import { defineConfig } from '@playwright/test';

/**
 * TestMu AI cloud execution configuration.
 *
 * Cloud combinations:
 * 1. Google Chrome latest on Windows 11
 * 2. Microsoft Edge latest on Windows 10
 *
 * The project-name format is parsed by the custom TestMu AI fixture:
 * browserName:browserVersion:platform@testmu
 */
export default defineConfig({
  testDir: './tests',

  /*
   * Allows independent tests and projects to execute in parallel.
   */
  fullyParallel: true,

  /*
   * Two workers allow both TestMu AI browser/OS combinations
   * to execute concurrently.
   */
  workers: 2,

  /*
   * Cloud browser provisioning, video creation and network-log collection
   * are slower than local execution.
   */
  timeout: 240_000,

  expect: {
    timeout: 20_000,
  },

  /*
   * Connection-level retries are handled inside our fixture.
   * Keeping Playwright retries at zero prevents duplicate cloud sessions
   * and avoids final results being marked as flaky.
   */
  retries: 0,

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
  ],

  outputDir: 'test-results',

  projects: [
    {
      name: 'Chrome:latest:Windows 11@testmu',
      use: {
        viewport: {
          width: 1440,
          height: 900,
        },
      },
    },
    {
      name: 'MicrosoftEdge:latest:Windows 10@testmu',
      use: {
        viewport: {
          width: 1440,
          height: 900,
        },
      },
    },
  ],
});