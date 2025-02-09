import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { BasePlatformHeaderLoaderGuard } from '@pe/ng-kit/modules/platform-header';
import { AppTypeEnum } from '../core.entities';

@Injectable({ providedIn: 'root' })
export class NewPlatformHeaderLoaderGuard extends BasePlatformHeaderLoaderGuard {
  // constructor(injector: Injector) {
  //   super(injector);
  // }

  protected getAppRootTagName(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return 'app-builder';
  }

  protected getBusinessId(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return activatedRouteSnapshot.params.business || activatedRouteSnapshot.params.businessId;
  }

  protected getHeaderAppInputData(activatedRouteSnapshot: ActivatedRouteSnapshot): any {
    const data: any = {};
    const app: AppTypeEnum = this.getHeaderAppName(activatedRouteSnapshot) as AppTypeEnum;
    const appId: string = activatedRouteSnapshot.params.appId;
    data.business = this.getBusinessId(activatedRouteSnapshot);
    data.activeView = activatedRouteSnapshot.data.activeHeaderView;
    // set themes active view for business themes and payever themes
    // if (data.activeView === 'details' && activatedRouteSnapshot.queryParams.themeType !== ThemeType.AppTheme) {
    //   data.activeView = 'themes';
    // }

    switch (app) {
      case 'shop': {
        data.shop = appId;
        break;
      }
      case 'pos': {
        data.terminal = appId;
        break;
      }
      case 'marketing': {
        data.campaign = appId;
        const isNewThemeCreation: boolean =
          activatedRouteSnapshot.queryParams.newTheme === 'true' ||
            localStorage.getItem('pe-builder-new-theme') === 'true';

        if (isNewThemeCreation) {
          data.activeView = 'create-theme';
        }
        break;
      }
      default:
        break;
    }

    return data;
  }

  protected getHeaderAppName(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    const params = activatedRouteSnapshot.params;

    return params.app || params.appType;
  }

  protected needShowHeaderOfAnotherApp(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    if (activatedRouteSnapshot.parent.routeConfig.path === 'editor') {
      return false;
    }

    return !!this.getHeaderAppName(activatedRouteSnapshot); // && !this.platformHeaderService.isHeaderHasData;
  }
}
