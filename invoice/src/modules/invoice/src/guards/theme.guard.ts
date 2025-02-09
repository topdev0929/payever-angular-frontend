import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PebEditorApi, PebThemesApi } from '@pe/builder-api';
import { EnvService } from '@pe/common';
import { ThemesApi } from '@pe/themes';
import { InvoiceEnvService } from '../services/invoice-env.service';

@Injectable({ providedIn: 'any' })
export class InvoiceThemeGuard implements CanActivate {
  constructor(
    private api: PebEditorApi,
    private themesApi: ThemesApi,
    @Inject(EnvService) private envService: InvoiceEnvService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


    if (route?.firstChild?.params.invoiceId) {
      this.envService.invoiceId = route?.params?.invoiceId;
    }
    return this.api.getShopActiveTheme().pipe(
      switchMap(result => {
        if(!result.id){
         return this.themesApi.createApplicationTheme('new theme')
          .pipe(catchError(() => { return of({} as any); }))
        }
        return of(result)
      }),
      map((theme) => {
       return true
      }),
    );
  }
}
