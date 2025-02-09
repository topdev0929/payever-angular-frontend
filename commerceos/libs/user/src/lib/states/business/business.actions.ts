import { HttpErrorResponse } from '@angular/common/http';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BusinessInterface, UpdateBusinessInterface } from '@pe/business';


export enum BusinessActions {
  UpdateBusinessData = '[@pe/business] updateBusinessData',
  LoadBusinessData = '[@pe/business] LoadBusinessData',
  BusinessDataLoaded = '[@pe/business] BusinessDataLoaded',
  BusinessAccessOptions = '[@pe/business] BusinessAccessOptions',
  LoadBusinesses = '[@pe/business] LoadBusinesses',
  BusinessesLoaded = '[@pe/business] BusinessesLoaded',
  LoadBusinessFailed = '[@pe/business] LoadBusinessFailed',
  ResetBusinessState = '[@pe/business] ResetBusinessState',
  DefaultBusinessesLoaded = '[@pe/business] DefaultBusinessesLoaded',
}


export class UpdateBusinessData {
  static readonly type = BusinessActions.UpdateBusinessData;

  constructor(public id: string, public businessData: UpdateBusinessInterface) {
  }
}

export class LoadBusinessData {
  static readonly type = BusinessActions.LoadBusinessData;

  constructor(public uuid: string) {
  }
}

export class BusinessDataLoaded {
  static readonly type = BusinessActions.BusinessDataLoaded;

  constructor(public payload: BusinessInterface) {
  }
}

export class BusinessAccessOptions<T> {
  static readonly type = BusinessActions.BusinessAccessOptions;

  constructor(public payload: T) {
  }
}

export class LoadBusinesses {
  static readonly type = BusinessActions.LoadBusinesses;

  constructor(public active?: string, public page?: string, public limit?: string, public reload?: boolean) {
  }
}

export class BusinessesLoaded {
  static readonly type = BusinessActions.BusinessesLoaded;

  constructor(public payload: { businesses: BusinessInterface[], total: number }, public reload?: boolean) {
  }
}

export class DefaultBusinessesLoaded {
  static readonly type = BusinessActions.DefaultBusinessesLoaded;

  constructor(public payload: BusinessInterface, public reload?: boolean) {
  }
}

export class ResetBusinessState {
  static readonly type = BusinessActions.ResetBusinessState;
}

export class LoadBusinessFailed {
  static readonly type = BusinessActions.LoadBusinessFailed;

  constructor(public payload: HttpErrorResponse) {
  }
}
