import { Message } from 'discord.js';
import { sample as _sample } from 'lodash';
import { ICommand } from '../icommand';

export const DevOpsCommand: ICommand = {
  name: '@devops',
  helpDescription: 'gets help from devops',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.toLocaleLowerCase().startsWith('@devops'),
  command: async (msg: Message) => {
    // Create list of DevOps users
    const devopsUsers = [
      msg.client.users.cache.find((user) => user.username === 'krische'),
      msg.client.users.cache.find((user) => user.username === 'freedeau'),
    ].filter((user) => user !== undefined);

    const id = `DevOps01-${Math.floor(Math.random() * 9000) + 1000}`;
    const description = `As a DevOps customer, ${msg.cleanContent.replace(/^\@devops\s*/i, '')}`;
    const points = _sample([2, 3, 5, 8, 13]);
    await msg.channel.send(`<@${_sample(devopsUsers).id}> ${id} (${points} points) has been created and assigned to you.\n> ${description}`);
  },
};
