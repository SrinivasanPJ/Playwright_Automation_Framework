import {
  chromium,
  expect,
  test as base,
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  type Page,
  type TestInfo,
} from '@playwright/test';

const TESTMU_PROJECT_SUFFIX = '@testmu';

const TESTMU_ENDPOINT =
  'wss://cdp.lambdatest.com/playwright';

const MAX_CLOUD_CONNECTION_ATTEMPTS = 3;

type TestMuProject = {
  browserName: string;
  browserVersion: string;
  platform: string;
};

/**
 * Parses a TestMu AI project name.
 *
 * Expected format:
 * browserName:browserVersion:platform@testmu
 *
 * Examples:
 * Chrome:latest:Windows 11@testmu
 * MicrosoftEdge:latest:Windows 10@testmu
 */
function parseTestMuProject(
  projectName: string,
): TestMuProject {
  const normalizedName = projectName.replace(
    TESTMU_PROJECT_SUFFIX,
    '',
  );

  const [
    browserName,
    browserVersion,
    platform,
  ] = normalizedName.split(':');

  if (
    !browserName ||
    !browserVersion ||
    !platform
  ) {
    throw new Error(
      `Invalid TestMu AI project name "${projectName}". ` +
        'Expected browserName:browserVersion:platform@testmu.',
    );
  }

  return {
    browserName,
    browserVersion,
    platform,
  };
}

/**
 * Pauses execution between TestMu AI grid connection attempts.
 */
function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Determines whether a TestMu AI connection failure is temporary and
 * eligible for an internal retry.
 */
function isRetryableCloudConnectionError(
  error: unknown,
): boolean {
  const message =
    error instanceof Error
      ? `${error.message}\n${error.stack ?? ''}`
      : String(error);

  return [
    /500 Internal Server Error/i,
    /failed to setup CDP grid/i,
    /WebSocket was closed before the connection was established/i,
    /code=1006/i,
    /ECONNRESET/i,
    /ETIMEDOUT/i,
    /socket hang up/i,
  ].some((pattern) => pattern.test(message));
}

/**
 * Creates browser-context options for local and cloud runs.
 */
function getContextOptions(
  testInfo: TestInfo,
  isCloud: boolean,
): BrowserContextOptions {
  const configuredViewport =
    testInfo.project.use.viewport;

  return {
    viewport:
      configuredViewport === null
        ? null
        : configuredViewport ?? {
            width: 1440,
            height: 900,
          },

    ignoreHTTPSErrors: true,

    /*
     * TestMu AI records cloud videos through its desired capabilities.
     * Local execution records videos directly through Playwright.
     */
    ...(isCloud
      ? {}
      : {
          recordVideo: {
            dir: testInfo.outputPath('videos'),
            size: {
              width: 1280,
              height: 720,
            },
          },
        }),
  };
}

/**
 * Connects to a TestMu AI cloud browser.
 *
 * Temporary HTTP 500, WebSocket 1006 and grid-provisioning failures are
 * retried internally. Invalid credentials and non-retryable configuration
 * failures are reported immediately.
 */
async function connectToTestMu(
  testInfo: TestInfo,
): Promise<Browser> {
  const username = process.env.LT_USERNAME;
  const accessKey = process.env.LT_ACCESS_KEY;

  if (!username || !accessKey) {
    throw new Error(
      'Missing TestMu AI credentials. Set LT_USERNAME and ' +
        'LT_ACCESS_KEY in the .env file before cloud execution.',
    );
  }

  const project = parseTestMuProject(
    testInfo.project.name,
  );

  const buildName =
    process.env.LT_BUILD_NAME ??
    'Playwright 101 Certification Assignment';

  const capabilities = {
    browserName: project.browserName,
    browserVersion: project.browserVersion,

    'LT:Options': {
      platform: project.platform,

      projectName:
        'Playwright 101 Certification Assignment',

      build: buildName,

      name:
        `${testInfo.title} | ` +
        `${testInfo.project.name}`,

      user: username,
      accessKey,

      /*
       * Required cloud execution evidence.
       */
      network: true,
      video: true,
      console: true,
      visual: true,

      resolution: '1920x1080',

      tunnel: false,

      /*
       * TestMu AI selects a server/browser bundle compatible with the
       * Playwright client installed in this project.
       */
      useSpecificBundleVersion: false,
    },
  };

  const wsEndpoint =
    `${TESTMU_ENDPOINT}?capabilities=` +
    encodeURIComponent(
      JSON.stringify(capabilities),
    );

  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= MAX_CLOUD_CONNECTION_ATTEMPTS;
    attempt += 1
  ) {
    try {
      console.log(
        `Connecting to TestMu AI. ` +
          `Project: ${testInfo.project.name}. ` +
          `Attempt: ${attempt}/${MAX_CLOUD_CONNECTION_ATTEMPTS}`,
      );

      return await chromium.connect({
        wsEndpoint,
        timeout: 60_000,
      });
    } catch (error) {
      lastError = error;

      const shouldRetry =
        isRetryableCloudConnectionError(error) &&
        attempt < MAX_CLOUD_CONNECTION_ATTEMPTS;

      if (!shouldRetry) {
        throw error;
      }

      const retryDelayMilliseconds =
        attempt * 5_000;

      console.warn(
        `TestMu AI grid connection attempt ${attempt} failed. ` +
          `Retrying in ${
            retryDelayMilliseconds / 1_000
          } seconds.`,
      );

      await wait(retryDelayMilliseconds);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(
    'Unable to connect to the TestMu AI cloud browser.',
  );
}

/**
 * Launches locally installed Chrome or Microsoft Edge.
 */
async function launchLocalBrowser(
  playwright: typeof import('playwright-core'),
  testInfo: TestInfo,
): Promise<Browser> {
  const headless =
    process.env.HEADED !== 'true' &&
    process.env.PWDEBUG !== '1';

  const configuredChannel =
    testInfo.project.use.channel;

  if (configuredChannel === 'chrome') {
    return playwright.chromium.launch({
      channel: 'chrome',
      headless,
    });
  }

  if (configuredChannel === 'msedge') {
    return playwright.chromium.launch({
      channel: 'msedge',
      headless,
    });
  }

  throw new Error(
    `Unsupported local browser project ` +
      `"${testInfo.project.name}". ` +
      'Expected channel "chrome" or "msedge".',
  );
}

/**
 * Updates the final TestMu AI dashboard status.
 */
async function updateTestMuStatus(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  const passed =
    testInfo.status ===
    testInfo.expectedStatus;

  const errorText =
    testInfo.error?.message ??
    testInfo.error?.stack ??
    '';

  const remark = passed
    ? 'Test completed successfully.'
    : errorText.slice(0, 1_000);

  const action = {
    action: 'setTestStatus',
    arguments: {
      status: passed ? 'passed' : 'failed',
      remark,
    },
  };

  await page.evaluate(
    () => undefined,
    `lambdatest_action: ${JSON.stringify(
      action,
    )}`,
  );
}

/**
 * Adds collected console or network logs to the Playwright report.
 */
async function attachTextLog(
  testInfo: TestInfo,
  name: string,
  lines: string[],
): Promise<void> {
  if (lines.length === 0) {
    return;
  }

  await testInfo.attach(name, {
    body: Buffer.from(
      lines.join('\n'),
      'utf-8',
    ),
    contentType: 'text/plain',
  });
}

/**
 * Custom page fixture supporting:
 *
 * Local:
 * - Google Chrome
 * - Microsoft Edge
 *
 * TestMu AI:
 * - Chrome on Windows 11
 * - Microsoft Edge on Windows 10
 *
 * Evidence:
 * - Network logs
 * - Console logs
 * - Video
 * - Screenshots
 * - Playwright trace
 */
export const test = base.extend<{
  page: Page;
}>({
  page: async (
    { playwright },
    use,
    testInfo,
  ) => {
    const isCloud =
      testInfo.project.name.endsWith(
        TESTMU_PROJECT_SUFFIX,
      );

    const consoleLogs: string[] = [];
    const networkLogs: string[] = [];

    let browser: Browser | undefined;
    let context: BrowserContext | undefined;
    let page: Page | undefined;
    let traceStarted = false;

    try {
      browser = isCloud
        ? await connectToTestMu(testInfo)
        : await launchLocalBrowser(
            playwright,
            testInfo,
          );

      context = await browser.newContext(
        getContextOptions(
          testInfo,
          isCloud,
        ),
      );

      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });

      traceStarted = true;

      page = await context.newPage();

      page.on('console', (message) => {
        consoleLogs.push(
          `[${message.type()}] ${message.text()}`,
        );
      });

      page.on('request', (request) => {
        networkLogs.push(
          `REQUEST  ${request.method()} ${request.url()}`,
        );
      });

      page.on('response', (response) => {
        networkLogs.push(
          `RESPONSE ${response.status()} ${response.url()}`,
        );
      });

      page.on('requestfailed', (request) => {
        networkLogs.push(
          `FAILED   ${request.method()} ${request.url()} :: ` +
            `${
              request.failure()?.errorText ??
              'Unknown error'
            }`,
        );
      });

      await use(page);
    } finally {
      const passed =
        testInfo.status ===
        testInfo.expectedStatus;

      /*
       * Capture a screenshot for every completed test, not only failures.
       */
      if (page) {
        try {
          const screenshot =
            await page.screenshot({
              fullPage: true,
            });

          await testInfo.attach(
            passed
              ? 'final-screenshot'
              : 'failure-screenshot',
            {
              body: screenshot,
              contentType: 'image/png',
            },
          );
        } catch {
          /*
           * The remote browser may already have terminated after a
           * connection or infrastructure failure.
           */
        }
      }

      /*
       * Mark the cloud session as passed or failed.
       */
      if (page && isCloud) {
        try {
          await updateTestMuStatus(
            page,
            testInfo,
          );
        } catch {
          /*
           * Status-reporting failure must not replace the original result.
           */
        }
      }

      /*
       * Stop and attach Playwright tracing.
       */
      if (context && traceStarted) {
        const tracePath =
          testInfo.outputPath('trace.zip');

        try {
          await context.tracing.stop({
            path: tracePath,
          });

          await testInfo.attach(
            'playwright-trace',
            {
              path: tracePath,
              contentType:
                'application/zip',
            },
          );
        } catch {
          /*
           * Trace collection can fail when a cloud browser terminates
           * unexpectedly.
           */
        }
      }

      await attachTextLog(
        testInfo,
        'console-logs',
        consoleLogs,
      );

      await attachTextLog(
        testInfo,
        'network-logs',
        networkLogs,
      );

      /*
       * Local videos become available after closing the context.
       */
      const localVideo =
        !isCloud ? page?.video() : null;

      await context
        ?.close()
        .catch(() => undefined);

      if (localVideo) {
        try {
          const videoPath =
            await localVideo.path();

          await testInfo.attach('video', {
            path: videoPath,
            contentType: 'video/webm',
          });
        } catch {
          /*
           * Ignore missing video when the browser exits before finalizing it.
           */
        }
      }

      await browser
        ?.close()
        .catch(() => undefined);
    }
  },
});

export { expect };