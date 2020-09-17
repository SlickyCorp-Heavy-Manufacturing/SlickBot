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
      name: 'Elon Musk',
      nickname: 'elonmusk',
      avatar: 'https://pbs.twimg.com/profile_images/1295975423654977537/dHw9JcrK_400x400.jpg',
      text,
      retweets: 420,
      retweetsWithComments: 0,
      likes: 69,
    });
  },
};
