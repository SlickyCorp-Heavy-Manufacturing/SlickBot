import * as cheerio from 'cheerio';
import { BaseMessageOptions } from 'discord.js';
import got from 'got';
import { createHash } from 'node:crypto';

import { IScheduledPost } from 'src/ischeduledpost';

export const scheduledWeatherStory: IScheduledPost = {
  channel: '742469521977376980',
  cronDate: '*/30 * * * *',
  getMessage: async (): Promise<BaseMessageOptions[]> => {
    const images = await WeatherStory.getWeatherStories();
    return images.map((image) => {
      return {files: [Buffer.from(image)]};
    });
  }
}

export class WeatherStory {
  private static checksums: string[] = [];

  public static async getWeatherStories(): Promise<Uint8Array[]> {
    // If this is the first time we've run this function, then assume existing images were already posted
    const firstRun = this.checksums.length === 0;

    // Get the weather story page
    const page =  cheerio.load((await got('https://www.weather.gov/mkx/weatherstory')).body);

    // Download all images
    const images = await Promise.all(page('#tabs .c-tab img').toArray().map(async (img) => {
      return Uint8Array.from(((await got.get(img.attribs['src'], { responseType: 'buffer'})).body));
    }));

    // Return only unposted images
    return images.filter((image) => {
      // Hash the image
      const hash = createHash('sha256').update(image).digest('base64');

      if (firstRun) {
        // Assume image has already been posted on first run, so mark it as such
        this.checksums.push(hash);
        return false;
      } else {
        // Use this image if it hasn't been posted already
        if (this.checksums.indexOf(hash) > -1) {
          return false;
        } else {
          this.checksums.push(hash);
          return true;
        }
      }
    });
  }
}
