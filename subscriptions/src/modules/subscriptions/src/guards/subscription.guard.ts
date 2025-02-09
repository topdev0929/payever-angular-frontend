import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { PeSubscriptionApi } from '../api/subscription/abstract.subscription.api';
import { SubscriptionEnvService } from '../api/subscription/subscription-env.service';

@Injectable()
export class PeSubscriptionGuard implements CanActivate {
  constructor(private api: PeSubscriptionApi, @Inject(EnvService) private envService: SubscriptionEnvService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route?.firstChild?.firstChild?.params.applicationId) {
      this.envService.applicationId = route?.firstChild?.firstChild?.params?.applicationId;
      return this.api.getPlan(route?.firstChild?.firstChild?.params?.applicationId).pipe(
        map((data) => {
          route.data = { ...route.data, subscription: data };
          return true;
        }),
      );
    }
    return this.api.getAllPlans().pipe(
      switchMap((subscriptions) => {
        return subscriptions.length
          ? of(subscriptions)
          : this.api
              .addPlan({ name: this.envService.businessData.name })
              .pipe(map((subscription: any) => [subscription]));
      }),
      map((subscriptions) => {
        const defaultsubscription = subscriptions.find((item: any) => item.isDefault === true);
        if (!defaultsubscription) {
          this.envService.applicationId = subscriptions[0]._id;
          route.data = { ...route.data, subscription: subscriptions[0] };
        } else {
          this.envService.applicationId = defaultsubscription._id;
          route.data = { ...route.data, subscription: defaultsubscription };
        }

        return true;
      }),
      catchError(() => {
        return of(false);
      }),
    );
  }
}
