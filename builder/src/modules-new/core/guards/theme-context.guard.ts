import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';

import { ThemeData } from '../theme.data';

@Injectable({ providedIn: 'root' })
export class ThemeContextGuard implements CanActivate {
  constructor(private themeData: ThemeData) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.themeData.context = {
      applicationType: route.params.appType,
      applicationId: route.params.appId,
      businessId: route.params.businessId,
      channelSet: '', // channel set updated in ApplicationDataGuard
    };

    return of(true);
  }
}
