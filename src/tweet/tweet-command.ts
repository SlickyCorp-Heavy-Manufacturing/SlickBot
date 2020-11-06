import { Message } from 'discord.js';

import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const messageRegex = /^!tweet\s+(\w+)\s+(.+)/gims;

const split = (source: string, separator: RegExp, limit: number): string[] => {
  const out: string[] = [];

  for (let i = limit; i > 0; i -= 1) {
    out.push(source.slice(separator.lastIndex, separator.exec(source).index));
  }

  out.push(source.slice(separator.lastIndex));
  return out;
};

export const TweetCommand: ICommand = {
  name: '!tweet',
  helpDescription: 'Bot will respond with a tweet from given twitter user',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!tweet'),
  command: async (msg: Message) => {
    const parts = split(msg.content, /\s+/g, 2);

    await TweetGen.tweet(msg, {
      nickname: parts[1],
      text: parts[2],
      retweets: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
      retweetsWithComments: Math.floor(Math.random() * (1234 - 0 + 1) + 0),
      likes: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
    });
  },
};
