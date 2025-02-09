import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class MerchantModeGuard implements CanActivate {

  constructor() {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (route.queryParams['enableMerchantMode'] === 'true') {
      sessionStorage.setItem('enableMerchantMode', 'true');
    }
    return true;
  }
}
