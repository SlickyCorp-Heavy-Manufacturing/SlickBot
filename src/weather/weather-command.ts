import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand.js';
import { Weather } from './weather.js';

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
