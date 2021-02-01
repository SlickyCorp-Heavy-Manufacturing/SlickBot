import got from 'got';

export interface Drink {
  idDrink: string;
  strDrink: string;
  strCategory: string;
  strAlcoholic: string;
  strGlass: string;
  strInstructions: string;
  strDrinkThumb: string;
  dateModified: string;
  strIngredient1: string;
  strIngredient2: string;
  strIngredient3: string;
  strIngredient4: string;
  strIngredient5: string;
  strIngredient6: string;
  strIngredient7: string;
  strIngredient8: string;
  strIngredient9: string;
  strIngredient10: string;
  strIngredient11: string;
  strIngredient12: string;
  strIngredient13: string;
  strIngredient14: string;
  strIngredient15: string;
  strMeasure1: string;
  strMeasure2: string;
  strMeasure3: string;
  strMeasure4: string;
  strMeasure5: string;
  strMeasure6: string;
  strMeasure7: string;
  strMeasure8: string;
  strMeasure9: string;
  strMeasure10: string;
  strMeasure11: string;
  strMeasure12: string;
  strMeasure13: string;
  strMeasure14: string;
  strMeasure15: string;
}

export interface Drinks {
  drinks: Drink[];
}

export const getIngredientsAsArray = (drink: Drink): string[] => {
  const ingredients: string[] = [];
  if (drink.strIngredient1) ingredients.push(drink.strMeasure1 ? `${drink.strIngredient1} (${drink.strMeasure1})` : drink.strIngredient1);
  if (drink.strIngredient2) ingredients.push(drink.strMeasure2 ? `${drink.strIngredient2} (${drink.strMeasure2})` : drink.strIngredient2);
  if (drink.strIngredient3) ingredients.push(drink.strMeasure3 ? `${drink.strIngredient3} (${drink.strMeasure3})` : drink.strIngredient3);
  if (drink.strIngredient4) ingredients.push(drink.strMeasure4 ? `${drink.strIngredient4} (${drink.strMeasure4})` : drink.strIngredient4);
  if (drink.strIngredient5) ingredients.push(drink.strMeasure5 ? `${drink.strIngredient5} (${drink.strMeasure5})` : drink.strIngredient5);
  if (drink.strIngredient6) ingredients.push(drink.strMeasure6 ? `${drink.strIngredient6} (${drink.strMeasure6})` : drink.strIngredient6);
  if (drink.strIngredient7) ingredients.push(drink.strMeasure7 ? `${drink.strIngredient7} (${drink.strMeasure7})` : drink.strIngredient7);
  if (drink.strIngredient8) ingredients.push(drink.strMeasure8 ? `${drink.strIngredient8} (${drink.strMeasure8})` : drink.strIngredient8);
  if (drink.strIngredient9) ingredients.push(drink.strMeasure9 ? `${drink.strIngredient9} (${drink.strMeasure9})` : drink.strIngredient9);
  if (drink.strIngredient10) ingredients.push(drink.strMeasure10 ? `${drink.strIngredient10} (${drink.strMeasure10})` : drink.strIngredient10);
  if (drink.strIngredient11) ingredients.push(drink.strMeasure11 ? `${drink.strIngredient11} (${drink.strMeasure11})` : drink.strIngredient11);
  if (drink.strIngredient12) ingredients.push(drink.strMeasure12 ? `${drink.strIngredient12} (${drink.strMeasure12})` : drink.strIngredient12);
  if (drink.strIngredient13) ingredients.push(drink.strMeasure13 ? `${drink.strIngredient13} (${drink.strMeasure13})` : drink.strIngredient13);
  if (drink.strIngredient14) ingredients.push(drink.strMeasure14 ? `${drink.strIngredient14} (${drink.strMeasure14})` : drink.strIngredient14);
  if (drink.strIngredient15) ingredients.push(drink.strMeasure15 ? `${drink.strIngredient15} (${drink.strMeasure15})` : drink.strIngredient15);
  return ingredients;
};

export const randomCocktail = async (): Promise<Drink> => {
  const response = await got('https://www.thecocktaildb.com/api/json/v1/1/random.php', { responseType: 'json' });
  const drinks = response.body as Drinks;
  const drink = drinks.drinks[0];
  return drink;
};

export const findCocktail = async (cocktailName: string): Promise<Drink|null> => {
  const response = await got(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${cocktailName}`, { responseType: 'json' });
  const drinks = response.body as Drinks;
  if (drinks && drinks.drinks && drinks.drinks.length > 0) {
    return drinks.drinks[0];
  }
  return null;
};
