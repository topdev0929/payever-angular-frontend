import { Inject, Injectable } from '@angular/core';

import { PeAppEnv } from '@pe/app-env';
import { AppType, EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable()
export class PeAffiliateBuilderEnv implements PeAppEnv {
  id: string;
  business: string;
  type = AppType.Affiliates;
  host: string;
  api: string;
  ws: string;
  builder: string;
  mediaContainer = 'affiliate';

  constructor(
    @Inject(PE_ENV) env: EnvironmentConfigInterface,
  ) {
    this.host = env.primary.affiliatesHost;
    this.api = env.backend.builderAffiliate;
    this.ws = env.backend.builderAffiliateWs;
    this.builder = env.backend.builderAffiliate;
  }
}
