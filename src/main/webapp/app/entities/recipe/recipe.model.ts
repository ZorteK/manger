import { IIngredient } from 'app/entities/ingredient/ingredient.model';

export interface IRecipe {
  id?: number;
  name?: string | null;
  ingredients?: IIngredient[] | null;
}

export class Recipe implements IRecipe {
  constructor(public id?: number, public name?: string | null, public ingredients?: IIngredient[] | null) {}
}

export function getRecipeIdentifier(recipe: IRecipe): number | undefined {
  return recipe.id;
}
