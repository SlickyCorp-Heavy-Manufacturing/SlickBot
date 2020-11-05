import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const commandString = '!elon';

export const RocketManCommand: ICommand = {
  name: commandString,
  helpDescription: 'Bot will respond with a tweet from the rocket man',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith(commandString),
  command: async (msg: Message) => {
    const text = msg.cleanContent.substring(commandString.length);

    await TweetGen.tweet(msg, {
      nickname: 'elonmusk',
      text,
      retweets: 420,
      retweetsWithComments: 0,
      likes: 69,
    });
  },
};
