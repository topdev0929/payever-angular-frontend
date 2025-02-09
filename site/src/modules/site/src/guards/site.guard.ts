import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { SiteEnvService } from '../service/site-env.service';
import { PebSitesApi } from '../service/site/abstract.sites.api';

@Injectable()
export class PebSiteGuard implements CanActivate {

  constructor(
    private api: PebSitesApi,
    @Inject(EnvService) private envService: SiteEnvService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route?.firstChild?.firstChild?.params.siteId) {
      this.envService.siteId = route?.firstChild?.firstChild?.params?.siteId;
      return this.api.getSingleSite(route?.firstChild?.firstChild?.params?.siteId).pipe(
        map(data => {
          route.data = { ...route.data, site: data };
          return true;
        }),
      )
    }
    return this.api.getSiteList().pipe(
      switchMap(sites => {
        return sites.length ? of(sites) :
          this.api.createSite({ name: this.envService.businessName }).pipe(map(site => [site]));
      }),
      map((sites) => {
        const defaultSite = sites.find(site => site.isDefault === true);

        if (!defaultSite) {
          this.envService.siteId = sites[0].id;
          route.data = { ...route.data, site: sites[0] };
          return true;
        }
        this.envService.siteId = defaultSite.id;
        route.data = { ...route.data, site: defaultSite };
        return true;
      }),
      catchError(() => {
        return of(false);
      }),
    )
  }
}
