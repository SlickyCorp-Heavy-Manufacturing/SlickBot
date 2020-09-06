import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const commandString = '!trump';

export const TrompoCommand: ICommand = {
  name: commandString,
  helpDescription: 'Bot will respond with a turomu tweet',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith(commandString),
  command: async (msg: Message) => {
    const text = msg.content.substring(commandString.length);

    await TweetGen.tweet(msg, {
      name: 'Donald J. Trump',
      nickname: 'realDonaldTrump',
      avatar: 'https://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_400x400.jpg',
      text,
    });
  },
};
