/**
 * Options for the screenshot command.
 */
export default interface ScreenshotOptions {
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
