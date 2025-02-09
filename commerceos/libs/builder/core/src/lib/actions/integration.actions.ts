import { PebMap } from '../models';

export class PebIntegrationApiCachedDataAddAction {
  static readonly type = '[PEB/Integration] API Cached Data Add';

  constructor(public data: PebMap<any>) {
  }
}

export class PebIntegrationApiCachedDataClearAllAction {
  static readonly type = '[PEB/Integration] API Cached Data Clear All';
}