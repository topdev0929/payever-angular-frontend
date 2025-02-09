import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder/api';
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
    this.themesApi.applicationId = this.envService.businessId;

    return this.api.getActiveTheme().pipe(
      map(result => !!result.id),
    );
  }
}
