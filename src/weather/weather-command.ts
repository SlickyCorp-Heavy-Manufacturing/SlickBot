import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand';
import { Weather } from './weather';

export const WeatherCommand: ICommand = {
  name: '!weather',
  helpDescription: 'Bot will respond with the weather',
  showInHelp: true,
  trigger: (msg: Message) => msg.content === '!weather',
  command: async (msg: Message) => {
    const value = await Weather.currentWeather();
    await (msg.channel as TextChannel).send(value);
  },
};
