import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand';
import { Covid } from './covid';
import { DateTime } from 'luxon'

export const CovidCommand: ICommand = {
  name: '!covid',
  helpDescription: 'Return the new daily deaths from covid today.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!covid') && (msg.channel as TextChannel).name === 'covid-tendies',
  command: async (msg: Message) => {
    const usDaily = await Covid.usDaily();
    msg.channel.send(usDaily);
  },
};

export const CovidWiCommand: ICommand = {
  name: '!covidwi',
  helpDescription: 'Return the new daily deaths from covid in Wisconsin today.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!covidwi'),
  command: async (msg: Message) => {
    const startDate = DateTime.utc(2020, 10, 27);
    const endDate = DateTime.utc(2020, 10, 28);

    const usDaily = await Covid.getDHSData(startDate, endDate);
    msg.channel.send(usDaily);
  },
};
