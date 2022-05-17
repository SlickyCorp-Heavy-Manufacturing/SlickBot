import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { Tendies } from './tendies';

export const CryptoCommand: ICommand = {
  name: '!crypto',
  helpDescription: 'Bot will respond with the exchange rate for a given crypto currency',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!crypto'),
  command: async (msg: Message) => {
    const value = await Tendies.crypto(msg.content.replace('!crypto', '').trim());
    await msg.channel.send(value);
  },
};
