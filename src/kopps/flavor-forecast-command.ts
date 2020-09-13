import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { Flavor, FlavorForecast, KoppsFlavorForecast } from './kopps-flavor-forecast';

export const FlavorForecastCommand: ICommand = {
  name: '!flavor-forecast',
  helpDescription: 'Bot will respond with the flavor forecast at kopps',
  showInHelp: true,
  trigger: (msg: Message) => msg.content === '!flavor-forecast',
  command: async (msg: Message) => {
    const forecasts = await KoppsFlavorForecast.flavorForecast();

    // Respond with each day seperately, since discord has a message size limit
    const forecastMessages = forecasts.map((dayForecast: FlavorForecast) => {
      let forecast = `${dayForecast.date}\n`;
      forecast += dayForecast.flavors.map((flavor: Flavor) => `  ${flavor.flavor} - ${flavor.description}`).join('\n');
      return forecast;
    }).map((forecast: string) => msg.channel.send(forecast));

    forecastMessages.reduce(
      (promiseChain, currentPromise) => promiseChain.then((chainResults) => currentPromise.then(
        (currentResult) => [...chainResults, currentResult],
      )),
      Promise.resolve([]),
    ).then();
  },
};
