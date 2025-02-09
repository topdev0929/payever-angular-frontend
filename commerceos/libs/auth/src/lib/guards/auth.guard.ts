import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { PeAuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: PeAuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!this.authService.token) {
      this.authService.redirectToEntryPage('/', state.url);

      return false;
    }

    if (this.authService.refreshToken && this.authService.isRefreshTokenExpired()) {
      this.authService.redirectToEntryPage('/login', state.url);
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
