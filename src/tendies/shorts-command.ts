import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand.js';
import { Tendies } from './tendies.js';

export const ShortsCommand: ICommand = {
  name: '!shorts',
  helpDescription: 'Bot will respond with the short interest of a specific symbol. Usage: !shorts SYMBOL',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!shorts'),
  command: async (msg: Message) => {
    const value = await Tendies.shorts(msg.content.replace('!shorts', '').trim());
    await (msg.channel as TextChannel).send(value);
  },
};
