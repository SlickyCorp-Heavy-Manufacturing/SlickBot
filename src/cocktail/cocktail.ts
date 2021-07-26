import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { findCocktail, getIngredientsAsArray } from './cocktail-db';

export const GetCocktail: ICommand = {
  name: '!cocktail',
  helpDescription: 'Ask how to make a specific cocktail. e.g. `!cocktail Quick`',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!cocktail '),
  command: async (msg: Message) => {
    const cocktailName = msg.content.replace('!cocktail', '').trim();
    const drink = await findCocktail(cocktailName);
    if (drink) {
      msg.channel.send(`*${drink.strDrink}* is best served in a ${drink.strGlass}.

Ingredients: ${getIngredientsAsArray(drink).join(', ')}
              
${drink.strInstructions}
              
${drink.strDrinkThumb}`, { split: false });
    } else {
      msg.channel.send('Sorry. I\'m not familiar wth that cocktail.', { split: false });
    }
  },
};
