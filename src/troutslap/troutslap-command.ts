import { ICommand } from '../icommand';
import { Message, TextChannel } from 'discord.js';
import { Troutslap } from './troutslap';

export const TroutslapCommand: ICommand = {
    name: '!troutslap',
    helpDescription: 'Slap users around with a trout. See "!troutslap help" for more details.',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!troutslap'), 
    command: (msg: Message) => {
        var retval = Troutslap.slap(msg);
        return Promise.resolve(retval);
    }
}