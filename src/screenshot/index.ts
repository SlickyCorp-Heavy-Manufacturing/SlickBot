import puppeteer, { Browser, Viewport } from 'puppeteer';

/**
 * Options for the screenshot command.
 */
export declare interface ScreenshotOptions {
  /**
   * The selector string of the element that should be screenshotted.
   */
  readonly element: string;
  /**
   * The URL of the page that should be loaded.
   */
  readonly url: string;
  /**
   * The viewport of the page.
   */
  readonly viewport: Viewport;
  /**
   * Wait for this before screnshotting.
   */
  readonly waitFor: {
    /**
     * Wait for the element matching this selector to appear on the page.
     */
    readonly selector?: string;
    /**
     * Maximum time to wait in milliseconds. Pass `0` to disable timeout.
     */
    readonly timeout: number;
  }
}

/**
 * Grabs a screenshot of a web page.
   * @param options The options for grabbing a screenshot.
   * @returns Binary array of PNG screenshot.
 */
export default async (options: ScreenshotOptions): Promise<Uint8Array<ArrayBufferLike>> => {
  let browser: Browser | undefined;
  try {
    // Load Browser
    browser = await puppeteer.launch({
      browser: 'firefox',
      defaultViewport: null,
      args: ['--no-sandbox'],
    });

    // Load Page
    const page = await browser.newPage();
    await page.setViewport(options.viewport);
    await page.goto(options.url);
    if (options.waitFor.selector) {
      await page.waitForSelector(options.waitFor.selector, { timeout: options.waitFor.timeout });
    }

    // Get Screenshot
    const element = await page.$(options.element);
    if (!element) {
      throw new Error(`Element matching selector '${options.element}' was not found.`);
    }
    const boundingBox = await element.boundingBox();
    if (!boundingBox) {
      throw new Error(`Unable to get boundinb box of element '${options.element}.`);
    }
    return await page.screenshot({
      clip: boundingBox,
      encoding: 'binary',
      type: 'png',
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
