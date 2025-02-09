import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { PeAuthService } from '../services/auth.service';

@Injectable()
export class TemporarySecondFactorJustPassedOnlyGuard implements CanActivate {
  constructor(private authService: PeAuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (this.authService.isSecondFactorAuthPassedAsPermanent()) {
      return true;
    }
    if (!this.authService.isSecondFactorJustPassed()) {
      return this.authService.resetTemporarySecondFactor().pipe(
        flatMap(() => {
          return this.authService.repeatSendCode();
        }),
        map(() => {
          this.authService.redirectToEntryPageWithUrl('second-factor-code', state.url);

          return false;
        })
      );
    }

    return true;
  }
}
