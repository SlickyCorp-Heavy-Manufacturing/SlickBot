import { Message, User } from 'discord.js';
import { sample as _sample } from 'lodash';
import { ICommand } from '../icommand';

export class TechTrackStory {
  private static readonly DEVOPS_USERS = ['[EliteTerrorist]AbeLincoln'];

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
  public static fromMessage(msg: Message): TechTrackStory {
    const potentialAssignees = this.DEVOPS_USERS
      .map((username) => msg.client.users.cache.find((user) => user.username === username))
      .filter((user) => user !== undefined);

    const id = `RAIDARCH01-${Math.floor(Math.random() * 9000) + 1000}`;
    const description = `As someone who doesn't want to do their job, ${msg.cleanContent.replace(/^@techtrack\s*/i, '')}`;
    const points = _sample([2, 3, 5, 8, 13]);

    return new TechTrackStory(_sample(potentialAssignees), description, id, points);
  }
}

export const TechTrackCommand: ICommand = {
  name: '@techtrack',
  helpDescription: 'gets help from Tech Track',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.toLocaleLowerCase().startsWith('@techtrack'),
  command: async (msg: Message) => {
    const story = TechTrackStory.fromMessage(msg);
    await msg.channel.send(`<@${story.assignee.id}> ${story.id} (${story.points} points) has been created and assigned to you.\n> ${story.description}`);
  },
};
