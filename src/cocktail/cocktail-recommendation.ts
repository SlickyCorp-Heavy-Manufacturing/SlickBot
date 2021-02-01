import { Message } from 'discord.js';
import got from 'got';
import { ICommand } from '../icommand';
import { Drinks, THE_COCKTAIL_DB_RANDOM_URL } from './cocktail-db';

export const CocktailRecommendation: ICommand = {
  name: '!cocktail-recommendation',
  helpDescription: 'Get a slick cocktail recommendation.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!cocktail-recommendation'),
  command: async (msg: Message) => {
    const response = await got(THE_COCKTAIL_DB_RANDOM_URL, { responseType: 'json' });
    const drinks = response.body as Drinks;
    const drink = drinks.drinks[0];
    msg.channel.send(`I would have to recommend a *${drink.strDrink}* served in a ${drink.strGlass}.

${drink.strInstructions}

${drink.strDrinkThumb}`);
  },
};
