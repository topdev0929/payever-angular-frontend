export enum ProductsActions {
  SaveProducts = '[@pe/apps/products] SaveProducts',
  ClearProducts = '[@pe/apps/products] ClearProducts',
}

export class SaveProducts {
  static readonly type = ProductsActions.SaveProducts;

  constructor(public payload: any) {}
}

export class ClearProducts {
  static readonly type = ProductsActions.ClearProducts;

  constructor(public payload: any) {}
}
