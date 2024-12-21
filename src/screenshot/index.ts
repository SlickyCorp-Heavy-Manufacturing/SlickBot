import { PuppeteerBlocker } from '@ghostery/adblocker-puppeteer';
import { Browser, TimeoutError, Viewport } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'cross-fetch';

/**
 * Options for the screenshot command.
 */
export declare interface ScreenshotOptions {
  /**
   * Click these elements before taking the screenshot.
   */
  readonly clicks?: [
    {
      /**
       * The selector string of the elment to click.
       */
      readonly element: string;
      /**
       * Wait for this after clicking.
       */
      readonly waitFor?: {
        /**
         * Wait for the timeout duration.
         */
        readonly duration?: boolean;
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
  ];
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
export default class Screenshot {
  public static async get(options: ScreenshotOptions): Promise<Uint8Array<ArrayBufferLike>> {
    puppeteer.use(StealthPlugin());
    let browser: Browser | undefined;
    try {
      console.log('Loading browser for screenshot...');
      // Load Browser
      browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        browser: 'chrome',
        defaultViewport: null,
        headless: true,
      });
      console.log('  - done');

      // Load Page
      console.log('Loading page for screenshot...');
      const page = await browser.newPage();
      const blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch)
      await blocker.enableBlockingInPage(page);
      await page.setViewport(options.viewport);
      await page.goto(options.url);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await page.solveRecaptchas();
      await page.waitForNavigation();
      if (options.waitFor.selector) {
        console.log(`  - Waiting for element '${options.waitFor.selector}'...`);
        try {
          await page.waitForSelector(options.waitFor.selector, { timeout: options.waitFor.timeout });
        } catch (error: unknown) {
          if (error instanceof TimeoutError) {
            console.error('Timeout occurred, grabbing screenshot of whole page');
            const element = await page.$('body');
            if (element) {
              const boundingBox = await element.boundingBox();
              if (boundingBox) {
                return await page.screenshot({
                  clip: boundingBox,
                  encoding: 'binary',
                  type: 'png',
                });
              }
            }
          }
          throw error;
        }
        console.log('    - done');
      }

      // Click any elements
      if (options.clicks) {
        for (const click of options.clicks) {
          console.log(`  - Clicking '${click.element}'...`);
          await page.click(click.element);
          console.log('    - done');
          if (click.waitFor) {
            if (click.waitFor.duration) {
              await new Promise(res => setTimeout(res, click.waitFor.timeout));
            }
            if (click.waitFor.selector) {
              console.log(`  - Waiting for element '${click.waitFor.selector}'...`);
              await page.waitForSelector(click.waitFor.selector, { timeout: click.waitFor.timeout });
              console.log('    - done');
            }
          }
        }
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
}
