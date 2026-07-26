import { defineConfig } from '@playwright/test';

/**
 * Local configuration used to verify the assignment scenarios before
 * consuming TestMu AI cloud automation minutes.
 *
 * Local browser combinations:
 * 1. Installed Google Chrome
 * 2. Installed Microsoft Edge
 */
export default defineConfig({
  testDir: './tests',

  // Allows independent tests and browser projects to run in parallel.
  fullyParallel: true,

  // Chrome and Edge can run concurrently.
  workers: 2,

  timeout: 90_000,

  expect: {
    timeout: 15_000,
  },

  // Do not retry locally so that actual failures are immediately visible.
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
      name: 'local-chrome',
      use: {
        channel: 'chrome',
        viewport: {
          width: 1440,
          height: 900,
        },
      },
    },
    {
      name: 'local-edge',
      use: {
        channel: 'msedge',
        viewport: {
          width: 1440,
          height: 900,
        },
      },
    },
  ],
});