import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

type AppType = 'pos' | 'shop' | 'marketing' | 'builder';

@Injectable()
export class PlatformHeaderGuard  {

  private app: AppType;
  private parentApp: AppType;
  private appId: string;
  private readonly appName: string = 'products';

  constructor() {}

  protected getHeaderAppInputData(activatedRouteSnapshot: ActivatedRouteSnapshot): any {
    const data: any = {
      activeView: this.appName,
    };

    switch (this.app) {
      case 'shop': {
        data.shop = this.appId;
        break;
      }
      case 'pos': {
        data.terminal = this.appId;
        break;
      }
      case 'marketing': { // how can we get there if we don't show header for marketing? need to review
        data.campaign = this.appId;
        break;
      }
      case 'builder': {
        data.activeView = 'details'; // these value used in SHOP and POS app to show builder
        break;
      }
      default: {
        break;
      }
    }

    return data;
  }

  protected getHeaderAppName(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    let app: string = activatedRouteSnapshot.queryParams.app;
    if (app === 'builder') {
      app = activatedRouteSnapshot.queryParams.parentApp;
    }
    return app;
  }

  protected needShowHeaderOfAnotherApp(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    // TODO Here is one bug: Mail app -> Products (from top left corner) will show 'Products' header.
    // But this header set by Builder, not by Mail app. Need somehow to move this logic into Mail app.
    // Otherwise header is missed ater refresh of products list (not product picker).
    if (this.app === 'marketing' || this.parentApp === 'marketing') {
      return false;
    } else {
      return !!activatedRouteSnapshot.queryParams.app;
    }
  }

  protected getAppRootTagName(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return 'app-products-standalone';
  }

  protected getBusinessId(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return activatedRouteSnapshot.params.slug;
  }

}
