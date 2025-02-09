import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BasePlatformHeaderLoaderGuard } from '@pe/ng-kit/modules/platform-header';

@Injectable()
export class PlatformHeaderGuard extends BasePlatformHeaderLoaderGuard {

  constructor(injector: Injector) {
    super(injector);
  }

  protected getAppRootTagName(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return 'transactions-app';
  }

  protected getBusinessId(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return activatedRouteSnapshot.params['uuid'];
  }

  protected getHeaderAppInputData(activatedRouteSnapshot: ActivatedRouteSnapshot): any {
    const app: 'shop' | 'pos' = this.getHeaderAppName(activatedRouteSnapshot) as 'pos' | 'shop';
    let data: any = {};
    if (app) {
      const channelSetId: string = activatedRouteSnapshot.queryParams[app];

      switch (app) {
        case 'shop':
        case 'pos': {
          data = {
            business: this.businessId,
            channelSet: channelSetId,
            activeView: 'transactions'
          };
          break;
        }
        default: {
          break;
        }
      }
    }
    return data;
  }

  protected getHeaderAppName(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    let app: string;
    if (activatedRouteSnapshot.queryParams['shop']) {
      app = 'shop';
    } else if (activatedRouteSnapshot.queryParams['pos']) {
      app = 'pos';
    }
    return app;
  }

  protected needShowHeaderOfAnotherApp(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    return activatedRouteSnapshot.queryParams['shop'] || activatedRouteSnapshot.queryParams['pos'];
  }

}
