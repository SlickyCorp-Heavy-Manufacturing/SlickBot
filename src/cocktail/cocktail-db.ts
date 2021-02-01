export const THE_COCKTAIL_DB_RANDOM_URL = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';

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
}

export interface Drinks {
  drinks: Drink[];
}

export const getIngredientsAsArray = (drink: Drink): string[] => {
  const ingredients: string[] = [];
  if (drink.strIngredient1) ingredients.push(drink.strIngredient1);
  if (drink.strIngredient2) ingredients.push(drink.strIngredient2);
  if (drink.strIngredient3) ingredients.push(drink.strIngredient3);
  if (drink.strIngredient4) ingredients.push(drink.strIngredient4);
  if (drink.strIngredient5) ingredients.push(drink.strIngredient5);
  if (drink.strIngredient6) ingredients.push(drink.strIngredient6);
  if (drink.strIngredient7) ingredients.push(drink.strIngredient7);
  if (drink.strIngredient8) ingredients.push(drink.strIngredient8);
  if (drink.strIngredient9) ingredients.push(drink.strIngredient9);
  if (drink.strIngredient10) ingredients.push(drink.strIngredient10);
  if (drink.strIngredient11) ingredients.push(drink.strIngredient11);
  if (drink.strIngredient12) ingredients.push(drink.strIngredient12);
  if (drink.strIngredient13) ingredients.push(drink.strIngredient13);
  if (drink.strIngredient14) ingredients.push(drink.strIngredient14);
  if (drink.strIngredient15) ingredients.push(drink.strIngredient15);
  return ingredients;
};
