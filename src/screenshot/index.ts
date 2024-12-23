import { PlaywrightBlocker } from '@ghostery/adblocker-playwright';
import fetch from 'cross-fetch';
import { Browser } from 'playwright';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

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
      readonly selector: string;
    }
  ];
  /**
   * The selector string of the element that should be screenshotted.
   */
  readonly selector: string;
  /**
   * The URL of the page that should be loaded.
   */
  readonly url: string;
  /**
   * The viewport of the page.
   */
  readonly viewportSize: {
    /**
     * Page height in pixels.
     */
    readonly height: number;
    /**
     * Page width in pixels.
     */
    readonly width: number;
  };
}

/**
 * Grabs a screenshot of a web page.
   * @param options The options for grabbing a screenshot.
   * @returns Binary array of PNG screenshot.
 */
export default class Screenshot {
  public static async get(options: ScreenshotOptions): Promise<Buffer> {
    let browser: Browser | undefined;
    try {
      // Load Browser
      console.log('Loading browser for screenshot...');
      chromium.use(StealthPlugin());
      browser = await chromium.launch({
        headless: true,
      });
      console.log('  - done');

      // Load Page
      console.log('Loading page for screenshot...');
      const page = await browser.newPage();
      await page.setViewportSize(options.viewportSize);
      const blocker = await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);
      await blocker.enableBlockingInPage(page);
      await page.goto(options.url, { waitUntil: 'networkidle' });
      console.log('  - done');

      // Clicks
      if (options.clicks) {
        for (const click of options.clicks) {
          console.log(`Clicking '${click.selector}...`);
          await page.locator(click.selector).click();
        }
      }

      // Get Screenshot
      console.log('Grabbing screenshot...');
      console.log(`  - locating element ${options.selector}...`);
      return await page.locator(options.selector).screenshot({type: 'png'});
    } finally {
      if (browser) {
        console.log('Closing screenshot browser...');
        await browser.close();
        console.log('  - done');
      }
    }
  }
}
