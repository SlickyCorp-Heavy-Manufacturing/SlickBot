import { ICommand } from '../icommand';
import { Message, TextChannel } from 'discord.js';
import { Troutslap } from './troutslap';

export const TroutslapCommand: ICommand = {
    name: 'Troutslap',
    helpDescription: '',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!troutslap'), 
    command: (msg: Message) => Troutslap.slap(msg)
}