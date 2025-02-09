import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';

import {
  PebConnectorProxyService,
  PebMockConnector,
  PebPagesConnector,
  PebProductsConnector,
  PebSettingsConnector,
} from '@pe/builder/integrations';

@Injectable()
export class PebServerConnectorsGuard implements CanActivate {
  constructor(
    private connectorService: PebConnectorProxyService,
    private mockConnector: PebMockConnector,
    private productsConnector: PebProductsConnector,
    private settingsConnector: PebSettingsConnector,
    private pagesConnector: PebPagesConnector,    
  ) { }

  canActivate(): Observable<boolean> {
    const connectors = [
      this.productsConnector,
      this.mockConnector,
      this.settingsConnector,
      this.pagesConnector,      
    ];

    return this.connectorService.register(connectors).initAll();
  }
}
