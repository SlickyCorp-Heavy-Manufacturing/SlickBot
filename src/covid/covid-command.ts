import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { Covid } from './covid';

export const CovidCommand: ICommand = {
  name: '!covid',
  helpDescription: 'Return the new daily deaths from covid today.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.match(/^!covid($|\s)/) !== null,
  command: async (msg: Message) => {
    const usDaily = await Covid.usDaily();
    msg.channel.send(usDaily);
  },
};

export const CovidWiCommand: ICommand = {
  name: '!covidwi',
  helpDescription: 'Display the WI COVID leaderboards.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!covidwi'),
  command: async (msg: Message) => {
    const leaderboardMsg = await Covid.wiLeaderboard();
    msg.channel.send(leaderboardMsg);
  },
};
