import * as captureWebsite from 'capture-website';
import { Message } from 'discord.js';
import fs from 'fs';
import { Page } from 'puppeteer';

export interface Tweet {
    nickname: string;
    name: string;
    avatar: string;
    text: string;
    retweets?: number;
    retweetsWithComments?: number;
    likes?: number;
}

export class TweetGen {
    private static readonly fakeTweetUri: string = 'https://lluiscamino.github.io/fake-tweet/';

    public static async tweet(msg: Message, tweet: Tweet): Promise<void> {
      await captureWebsite.file(TweetGen.fakeTweetUri, 'screenshot.png', {
        element: '.tweet',
        beforeScreenshot: async (page) => {
          await TweetGen.setValue(page, 'input#nickname', tweet.nickname);
          await TweetGen.setValue(page, 'input#name', tweet.name);
          await TweetGen.setValue(page, 'input#avatar', tweet.avatar);
          await page.select('select#display', 'lightsout');

          const date = new Date();
          await TweetGen.setValue(page, 'input#date',
            date.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

          await TweetGen.setValue(page, 'textarea#text', tweet.text);

          if (tweet.retweets) {
            await TweetGen.setValue(page, 'input#retweets', tweet.retweets.toString());
          }
          if (tweet.retweetsWithComments) {
            await TweetGen.setValue(page, 'input#retweetsWithComments', tweet.retweetsWithComments.toString());
          }
          if (tweet.likes) {
            await TweetGen.setValue(page, 'input#likes', tweet.likes.toString());
          }
        },
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },
      });

      await msg.channel.send({ files: ['screenshot.png'] });
      fs.unlink('screenshot.png', () => {});
    }

    private static async setValue(page: Page, selector: string, value: string) {
      await page.evaluate((selectorName) => {
        document.querySelector(selectorName).value = '';
      }, selector);
      await page.type(selector, value);
    }
}
