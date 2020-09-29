import { Message } from 'discord.js';
import { sample as _sample } from 'lodash';
import { ICommand } from '../icommand';

export const DevOpsCommand: ICommand = {
  name: '@devops',
  helpDescription: 'gets help from devops',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.startsWith('@devops'),
  command: (msg: Message) => {
    const devopsUsers = [
      msg.client.users.cache.find((user) => user.username === 'krische'),
      msg.client.users.cache.find((user) => user.username === 'freedeau'),
    ].filter((user) => user !== undefined);

    
    msg.channel.send(`<@${_sample(devopsUsers).id}> devops01-${Math.floor(Math.random() * 90000) + 10000} has been created and assigned to you`);
    return Promise.resolve();
  },
};
