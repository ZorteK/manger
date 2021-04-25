import { IIngredient } from 'app/entities/ingredient/ingredient.model';

export interface IStock {
  id?: number;
  quantity?: number | null;
  ingredient?: IIngredient | null;
}

export class Stock implements IStock {
  constructor(public id?: number, public quantity?: number | null, public ingredient?: IIngredient | null) {}
}

export function getStockIdentifier(stock: IStock): number | undefined {
  return stock.id;
}
