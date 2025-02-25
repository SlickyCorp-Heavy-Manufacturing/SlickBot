import { Message, TextChannel, User } from 'discord.js';
import { sample } from 'lodash-es';
import { ICommand } from '../icommand.js';

export class TeamStory {
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
   * @param descriptionPrefix The part of the description before the message supplied body
   * @param msg The Discord message
   * @param storyPrefix The prefix of the story ID before the number
   * @param users The list of Discord User IDs
   */
  public static async fromMessage(
    descriptionPrefix: string,
    msg: Message,
    storyPrefix: string,
    users: string[],
  ): Promise<TeamStory | undefined> {
    const potentialAssignees = await Promise.all(
      users.map(async (userId) => msg.client.users.fetch(userId)),
    );
    const id = `${storyPrefix}-${Math.floor(Math.random() * 9000) + 1000}`;
    const description = `${descriptionPrefix}, ${msg.cleanContent.replace(/^@[^\s]+\s+/i, '')}`;
    const points = sample([2, 3, 5, 8, 13]);

    const assignee = sample(potentialAssignees.filter((user) => user !== undefined));
    if (assignee) {
      return new TeamStory(
        assignee,
        description,
        id,
        points,
      );
    }
    return Promise.resolve(undefined);
  }
}

export const TechTrackCommand: ICommand = {
  name: '@techtrack',
  helpDescription: 'Get help from Tech Track',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.toLocaleLowerCase().startsWith('@techtrack'),
  command: async (msg: Message) => {
    const story = await TeamStory.fromMessage(
      'As someone who doesn\'t want to do their job',
      msg,
      'RAIDARCH01',
      [
        '208684753958731776', // MikeF
        '277609530915946497', // MarkT
      ],
    );
    if (story) {
      await (msg.channel as TextChannel).send(`<@${story.assignee.id}> ${story.id} (${story.points} points) has been created and assigned to you.\n> ${story.description}`);
    }
  },
};

export const DevOpsCommand: ICommand = {
  name: '@devops',
  helpDescription: 'Get help from devops',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.toLocaleLowerCase().startsWith('@devops'),
  command: async (msg: Message) => {
    const story = await TeamStory.fromMessage(
      'As a DevOps customer',
      msg,
      'RAIDOPS01',
      ['622595355153793045', '436298366952144907'], // Brian, MarkF
    );
    if (story) {
      await (msg.channel as TextChannel).send(`<@${story.assignee.id}> ${story.id} (${story.points} points) has been created and assigned to you.\n> ${story.description}`);
    }
  },
};
