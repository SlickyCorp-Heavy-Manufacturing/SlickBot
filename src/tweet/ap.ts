import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const commandString = '!ap';

export const APCommand: ICommand = {
  name: commandString,
  helpDescription: 'Bot will respond with a tweet from the associated press',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith(commandString),
  command: async (msg: Message) => {
    const text = msg.cleanContent.substring(commandString.length);

    await TweetGen.tweet(msg, {
      name: 'The Associated Press',
      nickname: 'AP',
      avatar: 'https://pbs.twimg.com/profile_images/461964160838803457/8z9FImcv_400x400.png',
      text,
      retweets: Math.floor(Math.random() * (4321 - 1234 + 1) + 1234),
      retweetsWithComments: Math.floor(Math.random() * (321 - 123 + 1) + 123),
      likes: Math.floor(Math.random() * (4321 - 1234 + 1) + 1234),
    });
  },
};
