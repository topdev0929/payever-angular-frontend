import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PeAppEnv } from '@pe/app-env';
import { PebIntegrationMessageHandler } from '@pe/builder/integrations';

@Component({
  selector: 'pe-shop-dashboard',
  templateUrl: './shop-dashboard.component.html',
  styleUrls: ['./shop-dashboard.component.scss'],
  providers: [PebIntegrationMessageHandler],
})
export class PebShopDashboardComponent {

  private enableCheckout  = new BehaviorSubject<boolean>(false);
  enableCheckout$ = this.enableCheckout.asObservable();

  constructor(
    public readonly appEnv: PeAppEnv,
    private readonly messageHandler: PebIntegrationMessageHandler,
  ) {
  }
}
