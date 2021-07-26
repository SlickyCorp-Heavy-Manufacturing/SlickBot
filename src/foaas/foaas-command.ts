import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { FOAAS } from './foaas';

export const FoffCommand: ICommand = {
  name: '!foff',
  helpDescription: 'Bot will say a random f*&k off message',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!foff'),
  command: async (msg: Message) => {
    const value = await FOAAS.foff(msg);
    msg.channel.send(value, { split: false });
  },
};
