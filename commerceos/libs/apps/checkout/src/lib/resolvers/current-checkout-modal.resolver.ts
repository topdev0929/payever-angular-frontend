import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { WelcomeStepEnum } from '../interfaces';

import { BaseCurrentCheckoutResolver } from './base-current-checkout.resolver';

@Injectable()
export class CurrentCheckoutModalResolver extends BaseCurrentCheckoutResolver {

  protected navigateToWelcomeScreen(route: ActivatedRouteSnapshot,
    businessUuid: string, checkoutId: string, step: WelcomeStepEnum): void {
    // TODO Not sure that it's correct
    let page = '';
    if (step === WelcomeStepEnum.Payments) {
      page = '/payments';
    } else if (step === WelcomeStepEnum.Details) {
      page = '/details';
    }
    this.router.navigate([`business/${businessUuid}/checkout/${checkoutId}/welcome${page}`], { replaceUrl: true });
  }

  protected navigateToCheckoutHome(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void {
    const routeName: string = route.data['routeName'] || 'view';

    this.router.navigate([`${this.navigateBasement(route, businessUuid)}/${checkoutId}/${routeName}`],
    { replaceUrl: true });
  }

  protected navigateToSwitch(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void {
    this.router.navigate([`${this.navigateBasement(route, businessUuid)}/switch`], { replaceUrl: true });
  }

  protected navigateBasement(route: ActivatedRouteSnapshot, businessUuid: string): string {
    const app: string = route.params['app'];
    const appId: string = route.params['appId'];
    const channelSetId: string = route.params['channelSetId'];

    return `business/${businessUuid}/checkout/modal/${app}/${appId}/${channelSetId}`;
  }
}
