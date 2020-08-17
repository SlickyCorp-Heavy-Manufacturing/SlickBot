import { ICommand } from './icommand';
import { Message } from 'discord.js';
import { commandList } from './commandList';

export const HelpCommand: ICommand = {
    name: '!help',
    helpDescription: '',
    trigger: (msg: Message) => msg.content === '!help', 
    command: () => {
        var retVal: string = '';
        commandList.forEach((command: ICommand) => {
            retVal += `${command.name} - ${command.helpDescription}\n`;
        });
        return Promise.resolve(retVal);
    },
}