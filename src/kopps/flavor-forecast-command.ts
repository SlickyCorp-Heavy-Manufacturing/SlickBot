import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand';
import { Flavor, FlavorForecast, KoppsFlavorForecast } from './kopps-flavor-forecast';

export const FlavorForecastCommand: ICommand = {
  name: '!flavor-forecast',
  helpDescription: 'Bot will respond with the flavor forecast at kopps',
  showInHelp: true,
  trigger: (msg: Message) => msg.content === '!flavor-forecast',
  command: async (msg: Message) => {
    const forecasts = await KoppsFlavorForecast.flavorForecast();
    const NUM_DAYS_TO_SHOW = 3;

    // Respond with each day seperately, since discord has a message size limit
    const forecastMessages = forecasts
      .slice(0, NUM_DAYS_TO_SHOW)
      .map((dayForecast: FlavorForecast) => {
        let forecast = `**${dayForecast.date}**\n`;
        forecast += dayForecast.flavors
          .map((flavor: Flavor) => `> _${flavor.flavor}_: ${flavor.description}`)
          .join('\n');
        return forecast;
      })
      .map((forecast: string) => (msg.channel as TextChannel).send(forecast));

    forecastMessages.reduce(
      (promiseChain, currentPromise) => promiseChain.then((chainResults) => currentPromise.then(
        (currentResult) => [...chainResults, currentResult],
      )),
      Promise.resolve([]),
    ).then();
  },
};
