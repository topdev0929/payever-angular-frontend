import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  PebConnectorProxyService,
  PebLanguageConnector,
  PebMessageConnector,
  PebMockConnector,
  PebPagesConnector,
  PebProductsConnector,
  PebSettingsConnector,
} from '@pe/builder/integrations';
import { PebEditorState } from '@pe/builder/state';
import { PeBuilderAppGuard } from '@pe/builder-app';

@Injectable()
export class PeSiteGuard implements CanActivate {
  constructor(
    private connectorService: PebConnectorProxyService,
    private mockConnector: PebMockConnector,
    private productsConnector: PebProductsConnector,
    private settingsConnector: PebSettingsConnector,
    private languageConnector: PebLanguageConnector,
    private builderAppGuard: PeBuilderAppGuard,
    private messageConnector: PebMessageConnector,
    private pagesConnector: PebPagesConnector,
    private readonly store: Store,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const builderApp$: Observable<any> = this.builderAppGuard.canActivate(route, state);

    return builderApp$.pipe(switchMap(builder => forkJoin([this.registerConnectors()]).pipe(map(() => builder))));
  }

  private registerConnectors(): Observable<boolean> {
    const connectors = [
      this.mockConnector,
      this.productsConnector,
      this.settingsConnector,
      this.messageConnector,
      this.languageConnector,
      this.pagesConnector,
    ];

    this.connectorService.setContext(this.store.select(PebEditorState.connectorContext));

    return this.connectorService.register(connectors).initAll();
  }
}
