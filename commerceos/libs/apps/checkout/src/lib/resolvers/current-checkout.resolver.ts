import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { WelcomeStepEnum } from '../interfaces';

import { BaseCurrentCheckoutResolver } from './base-current-checkout.resolver';

@Injectable()
export class CurrentCheckoutResolver extends BaseCurrentCheckoutResolver {

  protected navigateToWelcomeScreen(route: ActivatedRouteSnapshot, businessUuid: string,
    checkoutId: string, step: WelcomeStepEnum): void {
    let page = '' ;
    if (step === WelcomeStepEnum.Payments) {
      page = '/payments';
    } else if (step === WelcomeStepEnum.Details) {
      page = '/details';
    }
    this.router.navigate([`business/${businessUuid}/checkout/${checkoutId}/welcome${page}`], { replaceUrl: true });
  }

  protected navigateToCheckoutHome(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void {
    this.router.navigate([`business/${businessUuid}/checkout/${checkoutId}`], { replaceUrl: true });
  }

  protected navigateToSwitch(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void {
    this.router.navigate([`business/${businessUuid}/checkout/${checkoutId}`], { replaceUrl: true }); // TODO
  }

  protected navigateBasement(route: ActivatedRouteSnapshot, businessUuid: string): string {
    return `business/${businessUuid}/checkout`;
  }
}
