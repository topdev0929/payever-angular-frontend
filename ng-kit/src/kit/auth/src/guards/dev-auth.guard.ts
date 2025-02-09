import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { flatMap, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { EnvironmentConfigLoaderService } from '../../../environment-config';
import { AuthService } from '../services';

export interface DevAuthInterface {
  isDev: boolean;
  credentials: {
    login: string,
    password: string
  };
}

@Injectable()
export class DevAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private configLoaderService: EnvironmentConfigLoaderService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {

    const data: DevAuthInterface = route.data['devAuth'];
    if (this.authService.isAccessTokenExpired() && data && data.isDev  && data.credentials && data.credentials.login && data.credentials.password) {
      return this.configLoaderService.loadEnvironmentConfig().pipe(flatMap(() => {
        return this.authService.login({email: data.credentials.login, plainPassword: data.credentials.password}).pipe(
          take(1),
          map(() => true)
        );
      }));
    }

    return true;
  }
}
