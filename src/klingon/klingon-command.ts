import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand.js';
import { Translate } from './translate.js';

export const KlingonCommand: ICommand = {
  name: 'Klingon',
  helpDescription: 'Translate your message into Klingon.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!klingon'),
  command: async (msg: Message) => {
    const value: string = await Translate.translateToKlingon(msg.cleanContent);
    await (msg.channel as TextChannel).send(value);
  },
};
