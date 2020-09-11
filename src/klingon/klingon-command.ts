import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand';
import { Translate } from './translate';

export const KlingonCommand: ICommand = {
  name: 'Klingon',
  helpDescription: 'Translate your message into Klingon.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!klingon'),
  command: async (msg: Message) => {
    const value = Translate.translateToKlingon(msg.cleanContent);
    await msg.channel.send(Translate.DEFAULT_KLINGON_REPLY + value);
  },
};
