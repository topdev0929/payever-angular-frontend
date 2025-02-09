import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!this.authService.token) {
      this.authService.redirectToEntryPage('/entry', state.url);
      return false;
    }

    if (this.authService.refreshToken && this.authService.isRefreshTokenExpired()) {
      this.authService.redirectToEntryPage('/entry/login', state.url);
    }

    if (this.authService.isAccessTokenExpired()) {
      return this.authService.refreshAccessToken$().pipe(
        take(1),
        map(() => true)
      );
    }

    return true;
  }
}
