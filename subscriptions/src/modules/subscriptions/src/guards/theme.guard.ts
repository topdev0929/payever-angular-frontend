import { ActivatedRouteSnapshot, CanActivate, UrlTree } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { EnvService } from '@pe/common';
import { ThemesApi } from '@pe/themes';

import { SubscriptionEnvService } from '../api/subscription/subscription-env.service';

@Injectable({ providedIn: 'any' })
export class SubscriptionThemeGuard implements CanActivate {
  constructor(
    private api: PebEditorApi,
    private themesApi: ThemesApi,
    @Inject(EnvService) private envService: SubscriptionEnvService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const applicationId = this.envService.applicationId || route.parent.params.applicationId;
    if (!applicationId) {
      throw new Error('There is no SUBSCRIPTION ID in the url path');
    }

    return this.api.getShopActiveTheme().pipe(
      switchMap((result: any) => {
        if (!result.id){
          return this.themesApi.createApplicationTheme('new theme');
        }
        return of(result);
      }),
      map((theme) => {
        return true;
      }),
    );
  }
}
