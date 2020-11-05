import { Message } from 'discord.js';

import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const messageRegex = RegExp(/^!tweet\s+(?<handle>\w+)\s+(?<text>.+)/gms);

export const TweetCommand: ICommand = {
  name: '!tweet',
  helpDescription: 'Bot will respond with a tweet from given twitter user',
  showInHelp: true,
  trigger: (msg: Message) => messageRegex.test(msg.content),
  command: async (msg: Message) => {
    const match = msg.cleanContent.match(messageRegex);

    await TweetGen.tweet(msg, {
      nickname: match.groups.handle,
      text: match.groups.text,
      retweets: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
      retweetsWithComments: Math.floor(Math.random() * (1234 - 0 + 1) + 0),
      likes: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
    });
  },
};
