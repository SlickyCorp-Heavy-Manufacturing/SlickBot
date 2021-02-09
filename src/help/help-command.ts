import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { commandList } from '../commandList';

export const HelpCommand: ICommand = {
  name: '!help',
  helpDescription: 'List the available commands',
  showInHelp: true,
  trigger: (msg: Message) => msg.content === '!help',
  command: (msg: Message) => {
    const messages: string[] = [''];
    commandList.filter((command) => command.showInHelp).forEach((command: ICommand) => {
      // Break the message up into 2000 character chunks
      const newMessage: string = `${command.name} - ${command.helpDescription}\n`;
      if (newMessage.length + messages[messages.length - 1].length > 2000) {
        messages.push(`*continued*\n${newMessage}`);
      } else {
        messages[messages.length - 1] += newMessage;
      }
    });

    // Send all chunks
    messages.forEach((message: string) => {
      msg.channel.send(message);
    });

    return Promise.resolve();
  },
};
