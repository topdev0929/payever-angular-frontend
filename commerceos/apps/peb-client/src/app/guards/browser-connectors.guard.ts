import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';

import {
  PebConnectorProxyService,
  PebLanguageConnector,
  PebMessageConnector,
  PebMockConnector,
  PebPagesConnector,
  PebProductsConnector,
  PebCheckoutConnector,
} from '@pe/builder/integrations';


@Injectable()
export class PebBrowserConnectorsGuard implements CanActivate {
  constructor(
    private connectorService: PebConnectorProxyService,
    private mockConnector: PebMockConnector,
    private checkoutConnector: PebCheckoutConnector,
    private messageConnector: PebMessageConnector,
    private languageConnector: PebLanguageConnector,
    private pagesConnector: PebPagesConnector,
    private productsConnector: PebProductsConnector,
  ) { }

  canActivate(): Observable<boolean> {
    const connectors = [
      this.mockConnector,
      this.checkoutConnector,
      this.messageConnector,
      this.languageConnector,
      this.pagesConnector,
      this.productsConnector,
    ];
    this.connectorService.register(connectors).initAll();

    return of(true);
  }
}
