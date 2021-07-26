import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand';
import { Translate } from './translate';

export const KlingonCommand: ICommand = {
  name: 'Klingon',
  helpDescription: 'Translate your message into Klingon.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!klingon'),
  command: async (msg: Message) => {
    const value: string = await Translate.translateToKlingon(msg.cleanContent);
    await msg.channel.send(value, { split: false });
  },
};
