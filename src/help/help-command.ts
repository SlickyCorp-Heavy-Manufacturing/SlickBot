import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand';
import { commandList } from '../commandList';

export const HelpCommand: ICommand = {
  name: '!help',
  helpDescription: 'List the available commands',
  showInHelp: true,
  trigger: (msg: Message) => msg.content === '!help',
  command: async (msg: Message) => {
    const messages = ['```\n'];
    commandList.filter((command) => command.showInHelp).forEach((command: ICommand) => {
      const message = `${command.name} - ${command.helpDescription}\n`;
      if (messages[messages.length - 1].length + message.length > 1995) {
        messages[messages.length - 1] = `${messages[messages.length - 1]}\`\`\`\n`;
        messages.push(`*help continued...*\n\`\`\`\n${message}`);
      } else {
        messages[messages.length - 1] = `${messages[messages.length - 1]}${message}`;
      }
    });
    messages[messages.length - 1] = `${messages[messages.length - 1]}\`\`\`\n`;

    /* eslint-disable no-await-in-loop */
    for (const message of messages) {
      await (msg.channel as TextChannel).send(message);
    }
    /* eslint-enable no-await-in-loop */
    return Promise.resolve();
  },
};
