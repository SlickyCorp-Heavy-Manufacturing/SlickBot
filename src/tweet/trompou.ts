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
    const text = msg.cleanContent.substring(commandString.length);

    await TweetGen.tweet(msg, {
      nickname: 'realDonaldTrump',
      text,
    });
  },
};
