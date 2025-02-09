import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebEditorApi } from '@pe/builder/api';
import {
  PebCheckoutConnector,
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
import { PeSharedCheckoutStoreService } from '@pe/shared/checkout';

@Injectable()
export class PebShopGuard implements CanActivate {

  constructor(
    private connectorService: PebConnectorProxyService,
    private mockConnector: PebMockConnector,
    private productsConnector: PebProductsConnector,
    private settingsConnector: PebSettingsConnector,
    private checkoutConnector: PebCheckoutConnector,
    private messageConnector: PebMessageConnector,
    private languageConnector: PebLanguageConnector,
    private pagesConnector: PebPagesConnector,
    private editorApi: PebEditorApi,
    private checkoutStore: PeSharedCheckoutStoreService,
    private builderAppGuard: PeBuilderAppGuard,
    private readonly env: PeAppEnv,
    private readonly store: Store,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const builderApp$: Observable<any> = this.builderAppGuard.canActivate(route, state);

    return builderApp$.pipe(
      switchMap(builder => forkJoin([this.registerConnectors(), this.resolveChannelSet()]).pipe(
        map(() => builder),
      ),
      ),
    );
  }

  private registerConnectors(): Observable<boolean> {
    const connectors = [
      this.mockConnector,
      this.productsConnector,
      this.settingsConnector,
      this.checkoutConnector,
      this.messageConnector,
      this.languageConnector,
      this.pagesConnector,
    ];

    this.connectorService.setContext(this.store.select(PebEditorState.connectorContext));

    return this.connectorService.register(connectors).initAll();
  }

  private resolveChannelSet(): Observable<boolean> {
    if (!this.env.id) {
      return of(false);
    }

    return this.editorApi.getApp().pipe(
      map((app) => {
        this.checkoutStore.app = { ...app, channelSet: app.channelSet.id };

        return true;
      }),
    );
  }
}
