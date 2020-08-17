import { Message } from 'discord.js';
import { ICommand } from './icommand';

export const PingCommand: ICommand = {
    name: 'ping',
    helpDescription: 'Bot will reply to a user\'s ping with a pong',
    showInHelp: true,
    trigger: (msg: Message) => msg.content === 'ping', 
    command: () => Promise.resolve('pong'),
}