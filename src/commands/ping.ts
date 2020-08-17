import { ICommand } from './icommand';

export const PingCommand: ICommand = {
    name: 'ping',
    helpDescription: 'Bot will reply to a user\'s ping with a pong',
    command: () => Promise.resolve('pong'),
}