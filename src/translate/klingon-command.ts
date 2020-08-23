import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand';
import { Translate } from './translate';

export const KlingonCommand: ICommand = {
  name: 'Klingon',
  helpDescription: '',
  showInHelp: false,
  trigger: (msg: Message) => !msg.author.username.includes('SlickBot') && !msg.content.startsWith('https://') && (msg.channel as TextChannel).name === 'rikers_stellar_quarters',
  command: async (msg: Message) => {
    const value = Translate.translateToKlingon(msg.content);
    await msg.channel.send(Translate.DEFAULT_KLINGON_REPLY + value);
  },
};
