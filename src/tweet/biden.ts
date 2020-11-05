import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const commandString = '!biden';

export const BidenCommand: ICommand = {
  name: commandString,
  helpDescription: 'Bot will respond with a tweet from Joe Biden',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith(commandString),
  command: async (msg: Message) => {
    const text = msg.cleanContent.substring(commandString.length);

    await TweetGen.tweet(msg, {
      name: 'Joe Biden',
      nickname: 'JoeBiden',
      avatar: 'https://pbs.twimg.com/profile_images/1308769664240160770/AfgzWVE7_400x400.jpg',
      text,
      retweets: Math.floor(Math.random() * (654321 - 123456 + 1) + 123456),
      retweetsWithComments: Math.floor(Math.random() * (54321 - 12345 + 1) + 12345),
      likes: Math.floor(Math.random() * (654321 - 123456 + 1) + 123456),
    });
  },
};
