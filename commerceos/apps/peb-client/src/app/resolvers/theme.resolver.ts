import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';

import { PeAppEnv } from '@pe/app-env';
import { PebViewPage } from '@pe/builder/core';
import {
  PebViewContainerSetAction,
  PebViewPagesSetAction,
  PebViewQueryPatchAction,
  PebViewThemeSetAction,
} from '@pe/builder/view-actions';
import { PebViewCookiesPermissionService } from '@pe/builder/view-handlers';

import { CLIENT_CONTAINER, SSR_CONTAINER } from '../../constants';
import { PebClientEnv } from '../client-env.service';
import { PebSsrStateService } from '../services';


@Injectable({ providedIn: 'root' })
export class PebClientThemeResolver implements Resolve<any> {
  constructor(
    private readonly store: Store,
    @Inject(PLATFORM_ID) private platformId: string,
    private env: PebClientEnv,
    private readonly appEnv: PeAppEnv,
    private readonly ssrStateService: PebSsrStateService,
    private cookiesPermissionService: PebViewCookiesPermissionService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const appData = this.ssrStateService.getAppData();
    if (!appData) {
      return of(undefined);
    }

    this.env.business = appData.businessId;
    this.env.businessId = appData.businessId;
    this.appEnv.id = appData.applicationId;
    this.appEnv.business = appData.businessId;

    const renderContainer = isPlatformServer(this.platformId) ? SSR_CONTAINER : CLIENT_CONTAINER;

    this.store.dispatch([
      new PebViewContainerSetAction(renderContainer),
      new PebViewThemeSetAction(appData.theme),
      new PebViewPagesSetAction(appData.pages as PebViewPage[]),            
      new PebViewQueryPatchAction(appData.query),
    ]);

    this.cookiesPermissionService.initialize();
    this.ssrStateService.transferRenderDataFromSsrState();

    return of(appData.theme);
  }
}
