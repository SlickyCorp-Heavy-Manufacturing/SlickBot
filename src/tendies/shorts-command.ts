import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { Tendies } from './tendies';

export const ShortsCommand: ICommand = {
  name: '!shorts',
  helpDescription: 'Bot will respond with the short interest of a specific symbol. Usage: !tendies SYMBOL',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!shorts'),
  command: async (msg: Message) => {
    const value = await Tendies.shorts(msg.content.replace('!shorts', '').trim());
    await msg.channel.send(value, { split: false });
  },
};
