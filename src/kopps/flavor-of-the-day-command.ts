import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand.js';
import { KoppsFlavorForecast } from './kopps-flavor-forecast.js';

export const FlavorOfTheDayCommand: ICommand = {
  name: '!flavor-of-the-day',
  helpDescription: 'Bot will respond with the kopps flavor of the day',
  showInHelp: true,
  trigger: (msg: Message) => msg.content === '!flavor-of-the-day',
  command: async (msg: Message) => {
    const flavorOfTheDay = await KoppsFlavorForecast.flavorOfTheDay();
    const flavorNames: string[] = flavorOfTheDay.flavors.map((flavorObj) => flavorObj.flavor);
    const formatedFlavorString = `${flavorNames.slice(0, -1).join(',')} and ${flavorNames.at(-1)}`;
    await (msg.channel as TextChannel).send(`The flavor of the day at Kopps on ${flavorOfTheDay.date} is ${formatedFlavorString}.`);
  },
};
