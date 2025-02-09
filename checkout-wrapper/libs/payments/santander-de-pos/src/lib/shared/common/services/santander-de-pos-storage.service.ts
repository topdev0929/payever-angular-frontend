import { Injectable, Injector } from '@angular/core';

import { FlowStorage } from '@pe/checkout/storage';

import { GetRatesParamsInterface } from './rates-calculation-api.service';

export const TEMPORARY_RATE_PARAMS = 'temporaryRateParams';

@Injectable({
  providedIn: 'root',
})
export class SantanderDePosStorageService {
  private flowStorage: FlowStorage = this.injector.get(FlowStorage);

  constructor(private injector: Injector) {
  }

  setTemporaryRateParams(flowId: string, params: GetRatesParamsInterface): void {
    this.flowStorage.setData(flowId, TEMPORARY_RATE_PARAMS, params);
  }

  getTemporaryRateParams(flowId: string): GetRatesParamsInterface {
    return this.flowStorage.getData(flowId, TEMPORARY_RATE_PARAMS) || null;
  }
}
