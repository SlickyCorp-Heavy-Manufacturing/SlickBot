import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { getIngredientsAsArray, randomCocktail } from './cocktail-db';

export const CocktailRecommendation: ICommand = {
  name: '!cocktail-recommendation',
  helpDescription: 'Get a slick cocktail recommendation.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!cocktail-recommendation'),
  command: async (msg: Message) => {
    const drink = await randomCocktail();
    msg.channel.send(`I would have to recommend a *${drink.strDrink}* served in a ${drink.strGlass}.

Ingredients: ${getIngredientsAsArray(drink).join(', ')}
        
${drink.strInstructions}
        
${drink.strDrinkThumb}`);
  },
};
