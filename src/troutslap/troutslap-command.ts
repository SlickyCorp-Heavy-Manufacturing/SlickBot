import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { Troutslap } from './troutslap';

export const TroutslapCommand: ICommand = {
  name: '!troutslap',
  helpDescription: 'Slap users around with a trout. See "!troutslap help" for more details.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!troutslap'),
  command: (msg: Message) => Troutslap.slap(msg),
};
