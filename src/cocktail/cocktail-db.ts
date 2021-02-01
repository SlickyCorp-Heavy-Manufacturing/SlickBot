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
}

export interface Drinks {
  drinks: Drink[];
}
