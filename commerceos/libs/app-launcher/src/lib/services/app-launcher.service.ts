import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';

import { BusinessState } from '@pe/user';

import { LazyAppsLoaderService } from './lazy-apps-loader.service';


@Injectable({ providedIn: 'root' })
export class AppLauncherService {
  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  constructor(
    private lazyAppsLoaderService: LazyAppsLoaderService,

  ) { }

  launchApp(appName: string, urlPath?: string): Observable<boolean> {
    const nonMicroApps: string[] = [
      'affiliates',
      'shop',
      'blog',
      'studio',
      'contacts',
      'checkout',
      'connect',
      'social',
      'pos',
      'products',
      'settings',
    ];
    if (nonMicroApps.indexOf(appName) >= 0) {

      if (appName === 'pos' && !urlPath) {
        urlPath = 'pos';
      }

      if (appName === 'transactions' && !urlPath) {
        urlPath = 'transactions/list';
      }

      if (appName === 'settings' && !urlPath) {
        urlPath = 'settings';
      }

      return this.lazyAppsLoaderService.runPackagedApp(appName, urlPath);
    }
    urlPath = appName;

    return this.lazyAppsLoaderService.runPackagedApp(appName, urlPath);
  }

}
