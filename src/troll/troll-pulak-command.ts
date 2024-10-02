import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand';

export const TrollPulakCommand: ICommand = {
  name: 'TrollJPulak',
  helpDescription: '',
  showInHelp: false,
  trigger: (msg: Message) => msg.author.username === 'Pulak' && (msg.channel as TextChannel).name === 'thing-i-would-buy',
  command: async (msg: Message) => {
    await (msg.channel as TextChannel).send('https://i.redd.it/ng2ewzvfado21.jpg');
  },
};
