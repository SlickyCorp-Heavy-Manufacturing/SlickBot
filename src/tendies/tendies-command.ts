import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand.js';
import { Tendies } from './tendies.js';

export const TendiesCommand: ICommand = {
  name: '!tendies',
  helpDescription: 'Bot will respond with the tendie data or random stock if no symbol specified. Usage: !tendies [SYMBOL]',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!tendies'),
  command: async (msg: Message) => {
    const value = await Tendies.tendies(msg.content.replace('!tendies', '').trim());
    await (msg.channel as TextChannel).send(value);
  },
};
