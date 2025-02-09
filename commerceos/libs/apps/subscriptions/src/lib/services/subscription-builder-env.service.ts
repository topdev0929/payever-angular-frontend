import { Inject, Injectable } from '@angular/core';

import { PeAppEnv } from '@pe/app-env';
import { AppType, EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable()
export class PeSubscriptionBuilderEnv implements PeAppEnv {
  id: string;
  business: string;
  type = AppType.Subscriptions;
  host: string;
  api: string;
  ws: string;
  builder: string;
  mediaContainer = 'subscription';

  constructor(
    @Inject(PE_ENV) env: EnvironmentConfigInterface,
  ) {
    this.host = env.primary.subscriptionHost;
    this.api = env.backend.billingSubscription;
    this.ws = env.backend.builderSubscriptionWs;
    this.builder = env.backend.builderSubscription;
  }
}
