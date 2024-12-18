import { Message } from 'discord.js';
import { ICommand } from '../icommand.js';

export const LMGTFYCommand: ICommand = {
  name: 'lmgtfy',
  helpDescription: 'There are no stupid questions...',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.startsWith('!lmgtfy'),
  command: async (msg: Message) => {
    const message = (await msg.channel.messages.fetch({ limit: 2 })).last();
    if (message) {
      await message.reply(`https://lmgtfy.app/?q=${encodeURIComponent(message.cleanContent)}`);
    }
  },
};
