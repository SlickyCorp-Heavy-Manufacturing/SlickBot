import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { commandList } from '../commandList';

export const HelpCommand: ICommand = {
  name: '!help',
  helpDescription: 'List the available commands',
  showInHelp: true,
  trigger: (msg: Message) => msg.content === '!help',
  command: (msg: Message) => {
    let retVal: string = '';
    commandList.filter((command) => command.showInHelp).forEach((command: ICommand) => {
      retVal += `${command.name} - ${command.helpDescription}\n`;
    });
    msg.channel.send(retVal);
    return Promise.resolve();
  },
};
