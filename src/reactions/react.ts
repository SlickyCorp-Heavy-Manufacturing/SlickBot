import { Message } from 'discord.js';
import { ICommand } from '../icommand';

export const NiceReaction: ICommand = {
  name: 'nice reaction',
  helpDescription: '',
  showInHelp: false,
  trigger: (msg: Message) => new RegExp(`\\b69\\b`).test(msg.content),
  command: async (msg: Message) => {
    await msg.react('🇳');
    await msg.react('🇮');
    await msg.react('🇨');
    await msg.react('🇪');
  },
};
