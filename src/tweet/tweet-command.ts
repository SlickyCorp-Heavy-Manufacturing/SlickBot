import { Message } from 'discord.js';

import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const messageRegex = /^!tweet\s+(\w+)\s+(.+)/gims;

export const TweetCommand: ICommand = {
  name: '!tweet',
  helpDescription: 'Bot will respond with a tweet from given twitter user',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!tweet'),
  command: async (msg: Message) => {
    const match = messageRegex.exec(msg.content);

    await TweetGen.tweet(msg, {
      nickname: match[1],
      text: match[2],
      retweets: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
      retweetsWithComments: Math.floor(Math.random() * (1234 - 0 + 1) + 0),
      likes: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
    });
  },
};
