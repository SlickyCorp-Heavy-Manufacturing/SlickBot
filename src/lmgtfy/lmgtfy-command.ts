import { Message } from 'discord.js';
import { ICommand } from '../icommand.js';

export const LMGTFYCommand: ICommand = {
  name: 'lmgtfy',
  helpDescription: 'There are no stupid questions...',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.startsWith('!lmgtfy'),
  command: async (msg: Message) => {
    msg.channel.messages.fetch({ limit: 2 }).then((messages) => {
      messages.last().reply(`https://lmgtfy.app/?q=${encodeURIComponent(messages.last().cleanContent)}`);
    });
  },
};
