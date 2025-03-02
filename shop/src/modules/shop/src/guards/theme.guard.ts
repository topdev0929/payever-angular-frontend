import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { pebCreateEmptyShop } from '@pe/builder-core';
import { PebEditorApi, PebThemesApi } from '@pe/builder-api';
import { ShopEnvService } from '../services/shop-env.service';
import { EnvService } from '@pe/common';
import { ThemesApi } from '@pe/themes';

@Injectable({ providedIn: 'any' })
export class ShopThemeGuard implements CanActivate {
  constructor(
    private api: PebEditorApi,
    private themesApi: ThemesApi,
    @Inject(EnvService) private envService: ShopEnvService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const shopId = this.envService.shopId || route.parent.params.shopId;
    this.themesApi.applicationId = shopId;
    if (!shopId) {
      throw new Error('There is no SHOP ID in the url path');
    }

    return this.api.getShopActiveTheme().pipe(

      switchMap(result => {
        if(!result.id){
         return this.themesApi.createApplicationTheme('new theme')
        }
        return of(result)
      }),
      map((theme) => {
       return true
      }),
    );
  }
}
