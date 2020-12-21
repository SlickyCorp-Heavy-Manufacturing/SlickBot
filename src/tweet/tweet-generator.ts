import * as cheerio from 'cheerio';
import { Message } from 'discord.js';
import fs from 'fs';
import got from 'got';
import { withFile } from 'tmp-promise';
import { TwitterApi } from './twitter-api';

export interface Tweet {
  nickname: string;
  text: string;
  retweets?: number;
  retweetsWithComments?: number;
  likes?: number;
  verified?: boolean;
}

export class TweetGen {
  public static async tweet(msg: Message, tweet: Tweet): Promise<void> {
    await withFile(
      async (tmpFile) => {
        const profile = await TwitterApi.getUserDetails(tweet.nickname);
        const response = await got.get(
          'https://website-snapshot.herokuapp.com/tweet',
          {
            searchParams: {
              nickname: tweet.nickname,
              name: profile.name,
              avatar: profile.profile_image_url,
              text: tweet.text,
              retweets: tweet.retweets,
              retweetsWithComments: tweet.retweetsWithComments,
              likes: tweet.likes,
              verified: profile.verified,
            },
            responseType: 'buffer',
          },
        );
        fs.writeFileSync(tmpFile.path, response.body);
        await msg.channel.send({ files: [tmpFile.path] });
      },
      {
        prefix: `tweet-${tweet.nickname}-`,
        postfix: '.png',
      },
    );
  }
}
