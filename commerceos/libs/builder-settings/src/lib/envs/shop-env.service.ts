import { Inject, Injectable } from '@angular/core';

import { PeAppEnv } from '@pe/app-env';
import { AppType, EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable()
export class PeShopEnv implements PeAppEnv {
  id: string;
  business: string;
  type = AppType.Shop;
  host: string;
  api: string;
  ws: string;
  builder: string;
  mediaContainer = 'shop';

  constructor(
    @Inject(PE_ENV) env: EnvironmentConfigInterface,
  ) {
    this.host = env.primary.shopHost;
    this.api = env.backend.shop;
    this.ws = env.backend.builderShopWs;
    this.builder = env.backend.builderShop;
  }
}