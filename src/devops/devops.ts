import { Message } from 'discord.js';
import { ICommand } from '../icommand';

export const DevOpsCommand: ICommand = {
  name: '@devops',
  helpDescription: 'gets help from devops',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.startsWith('@devops'),
  command: (msg: Message) => {
    const devopsUser = msg.client.users.cache.find((user) => user.username === 'krische');
    msg.channel.send(`<@${devopsUser.id}> devops01-12345 has been created and assigned to you`);
    return Promise.resolve();
  },
};
