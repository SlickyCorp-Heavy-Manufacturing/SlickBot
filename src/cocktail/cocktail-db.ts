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
  const addIngredientToArray = (arr: string[], ingredient: string, measurement: string) => {
    if (ingredient) arr.push(measurement ? `${ingredient} (${measurement})` : ingredient);
  };

  const ingredients: string[] = [];
  addIngredientToArray(ingredients, drink.strIngredient1, drink.strMeasure1);
  addIngredientToArray(ingredients, drink.strIngredient2, drink.strMeasure2);
  addIngredientToArray(ingredients, drink.strIngredient3, drink.strMeasure3);
  addIngredientToArray(ingredients, drink.strIngredient4, drink.strMeasure4);
  addIngredientToArray(ingredients, drink.strIngredient5, drink.strMeasure5);
  addIngredientToArray(ingredients, drink.strIngredient6, drink.strMeasure6);
  addIngredientToArray(ingredients, drink.strIngredient7, drink.strMeasure7);
  addIngredientToArray(ingredients, drink.strIngredient8, drink.strMeasure8);
  addIngredientToArray(ingredients, drink.strIngredient9, drink.strMeasure9);
  addIngredientToArray(ingredients, drink.strIngredient10, drink.strMeasure10);
  addIngredientToArray(ingredients, drink.strIngredient11, drink.strMeasure11);
  addIngredientToArray(ingredients, drink.strIngredient12, drink.strMeasure12);
  addIngredientToArray(ingredients, drink.strIngredient13, drink.strMeasure13);
  addIngredientToArray(ingredients, drink.strIngredient14, drink.strMeasure14);
  addIngredientToArray(ingredients, drink.strIngredient15, drink.strMeasure15);

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
