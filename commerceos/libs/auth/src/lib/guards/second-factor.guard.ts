import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { PeAuthService } from '../services/auth.service';

@Injectable()
export class SecondFactorGuard implements CanActivate {
  constructor(private authService: PeAuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isSecondFactorAuthPassed()) {
      this.authService.repeatSendCode().subscribe(() => {
        this.authService.redirectToEntryPageWithUrl('second-factor-code', state.url);
      });

      return false;
    }

    return true;
  }
}
