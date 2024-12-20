import { PuppeteerBlocker } from '@ghostery/adblocker-puppeteer';
import puppeteer, { Browser, Viewport } from 'puppeteer';
import fetch from 'cross-fetch';

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
    console.log('Loading browser for screenshot...');
    // Load Browser
    browser = await puppeteer.launch({
      browser: 'chrome',
      defaultViewport: null,
      args: ['--no-sandbox'],
    });
    console.log('  - done');

    // Load Page
    console.log('Loading page for screenshot...');
    const page = await browser.newPage();
    const blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch)
    await blocker.enableBlockingInPage(page);
    await page.setViewport(options.viewport);
    await page.goto(options.url);
    if (options.waitFor.selector) {
      await page.waitForSelector(options.waitFor.selector, { timeout: options.waitFor.timeout });
    }
    console.log('  - done');

    // Get Screenshot
    console.log('Grabbing screenshot...');
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
      console.log('Closing screenshot browser...');
      await browser.close();
      console.log('  - done');
    }
  }
}
