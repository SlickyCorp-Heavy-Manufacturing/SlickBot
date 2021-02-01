import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { findCocktail, getIngredientsAsArray } from './cocktail-db';

export const GetCocktail: ICommand = {
  name: '!cocktail',
  helpDescription: 'Get a slick cocktail recommendation.',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!cocktail '),
  command: async (msg: Message) => {
    const cocktailName = msg.content.replace('!cocktail', '').trim();
    const drink = await findCocktail(cocktailName);
    if (drink) {
      msg.channel.send(`*${drink.strDrink}* is best served in a ${drink.strGlass}.

Ingredients: ${getIngredientsAsArray(drink).join(', ')}
              
${drink.strInstructions}
              
${drink.strDrinkThumb}`);
    } else {
      msg.channel.send('Sorry. I\'m not familiar wth that cocktail.');
    }
  },
};
