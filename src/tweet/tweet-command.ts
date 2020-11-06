import { Message } from 'discord.js';

import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const messageRegex = /^!tweet\s+(?<handle>\w+)\s+(?<text>.+)/gims;

export const TweetCommand: ICommand = {
  name: '!tweet',
  helpDescription: 'Bot will respond with a tweet from given twitter user',
  showInHelp: true,
  trigger: (msg: Message) => messageRegex.exec(msg.content) !== null,
  command: async (msg: Message) => {
    const match = messageRegex.exec(msg.content);
    await TweetGen.tweet(msg, {
      nickname: match['groups']['handle'], // eslint-disable-line dot-notation
      text: match['groups']['text'], // eslint-disable-line dot-notation
      retweets: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
      retweetsWithComments: Math.floor(Math.random() * (1234 - 0 + 1) + 0),
      likes: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
    });
  },
};
