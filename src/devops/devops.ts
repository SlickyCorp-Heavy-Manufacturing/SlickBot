import { Message, User } from 'discord.js';
import { sample as _sample } from 'lodash';
import { ICommand } from '../icommand';

export class DevOpsStory {
  private static readonly DEVOPS_USERS = ['krische', 'freedeau'];

  public readonly assignee: User;

  public readonly description: string;

  public readonly id: string;

  public readonly points: number;

  constructor(assignee: User, description: string, id: string, points: number) {
    this.assignee = assignee;
    this.description = description;
    this.id = id;
    this.points = points;
  }

  /**
   * Create a new DevOps story from a discord message
   * @param msg The Discord message
   */
  public static fromMessage(msg: Message): DevOpsStory {
    const potentialAssignees = this.DEVOPS_USERS
      .map((username) => msg.client.users.cache.find((user) => user.username === username))
      .filter((user) => user !== undefined);

    const id = `DevOps01-${Math.floor(Math.random() * 9000) + 1000}`;
    const description = `As a DevOps customer, ${msg.cleanContent.replace(/^@devops\s*/i, '')}`;
    const points = _sample([2, 3, 5, 8, 13]);

    return new DevOpsStory(_sample(potentialAssignees), description, id, points);
  }
}

export const DevOpsCommand: ICommand = {
  name: '@devops',
  helpDescription: 'gets help from devops',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.toLocaleLowerCase().startsWith('@devops'),
  command: async (msg: Message) => {
    const story = DevOpsStory.fromMessage(msg);
    await msg.channel.send(`<@${story.assignee.id}> ${story.id} (${story.points} points) has been created and assigned to you.\n> ${story.description}`);
  },
};
