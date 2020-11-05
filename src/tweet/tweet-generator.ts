import * as cheerio from 'cheerio';
import { Message } from 'discord.js';
import fs from 'fs';
import got from 'got';
import { withFile } from 'tmp-promise';

export interface Tweet {
  nickname: string;
  text: string;
  retweets?: number;
  retweetsWithComments?: number;
  likes?: number;
  verified?: boolean;
}

export interface TwitterProfile {
  avatar: string;
  name: string;
  nickname: string;
  verified: boolean;
}

export class TweetGen {
  public static async getTwitterProfile(nickname: string): Promise<TwitterProfile> {
    const response = await got(`https://mobile.twitter.com/${nickname}`);
    const page = cheerio.load(response.body);
    return Promise.resolve({
      avatar: page('.profile-details .avatar img').attr('src'),
      name: page('.profile-details .fullname').text().trim(),
      nickname,
      verified: page('.profile-details .user-info img[alt="Verified Account"]').length > 0,
    });
  }

  public static async tweet(msg: Message, tweet: Tweet): Promise<void> {
    await withFile(
      async (tmpFile) => {
        const profile = await this.getTwitterProfile(tweet.nickname);
        const response = await got.get(
          'https://website-snapshot.herokuapp.com/tweet',
          {
            searchParams: {
              nickname: tweet.nickname,
              name: profile.name,
              avatar: profile.avatar,
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
      { postfix: '.png' },
    );
  }
}
