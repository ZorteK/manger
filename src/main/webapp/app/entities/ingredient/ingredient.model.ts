import { IRecipe } from 'app/entities/recipe/recipe.model';

export interface IIngredient {
  id?: number;
  name?: string | null;
  recipes?: IRecipe[] | null;
}

export class Ingredient implements IIngredient {
  constructor(public id?: number, public name?: string | null, public recipes?: IRecipe[] | null) {}
}

export function getIngredientIdentifier(ingredient: IIngredient): number | undefined {
  return ingredient.id;
}
