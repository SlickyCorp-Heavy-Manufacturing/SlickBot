import { Message } from 'discord.js';
import fs from 'fs';
import got from 'got/dist/source';
import { withFile } from 'tmp-promise';

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
    await withFile(
      async (tmpFile) => {
        const response = await got.get(
          'http://website-snapshot.centralus.azurecontainer.io:8080/tweet',
          {
            searchParams: {
              nickname: tweet.nickname,
              name: tweet.name,
              avatar: tweet.avatar,
              text: tweet.text,
              retweets: tweet.retweets,
              retweetsWithComments: tweet.retweetsWithComments,
              likes: tweet.likes,
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
