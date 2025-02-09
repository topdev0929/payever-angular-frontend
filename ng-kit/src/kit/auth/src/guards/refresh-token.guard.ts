import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { AuthService } from '../services';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private authService: AuthService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (this.authService.isAccessTokenExpired() && !this.authService.isRefreshTokenExpired()) {
      return this.authService.asyncRefreshAccessToken().pipe(map(() => true));
    }

    if (this.authService.isRefreshTokenExpired()) {
      return this.authService.setToken('').pipe(flatMap(() => this.authService.setRefreshToken('')), map(() => true));
    }

    return of(true);
  }
}
