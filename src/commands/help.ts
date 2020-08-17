import { ICommand } from './icommand';

export const HelpCommand: ICommand = {
    name: '!help',
    helpDescription: '',
    command: () => Promise.resolve('no'),
}