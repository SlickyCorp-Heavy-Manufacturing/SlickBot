import { Message, TextChannel } from 'discord.js';
import { ICommand } from '../icommand.js';
import { getIngredientsAsArray, randomCocktail } from './cocktail-db.js';

export const CocktailRecommendation: ICommand = {
  name: '!cocktail-recommendation',
  helpDescription: 'Get a slick cocktail recommendation.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!cocktail-recommendation'),
  command: async (msg: Message) => {
    const drink = await randomCocktail();
    await (msg.channel as TextChannel).send(`I would have to recommend a *${drink.strDrink}* served in a ${drink.strGlass}.

Ingredients: ${getIngredientsAsArray(drink).join(', ')}

${drink.strInstructions}

${drink.strDrinkThumb}`);
  },
};
