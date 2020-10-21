import { Message } from 'discord.js';
import fs from 'fs';
import got from 'got/dist/source';

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
  public static async tweet(msg: Message, tweet: Tweet): Promise<void> {
    const response = await got.get('http://website-snapshot.centralus.azurecontainer.io:8080/tweet',
      {
        searchParams: {
          nickname: tweet.nickname,
          name: tweet.name,
          avatar: tweet.avatar,
          text: tweet.text,
        },
        responseType: 'text',
      });

    fs.writeFileSync('screenshot.png', response.body, { encoding: 'base64' });

    await msg.channel.send({ files: ['screenshot.png'] });
    fs.unlink('screenshot.png', () => {});
  }
}
