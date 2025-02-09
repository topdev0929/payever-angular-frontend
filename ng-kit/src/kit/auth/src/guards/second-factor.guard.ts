import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services';

@Injectable()
export class SecondFactorGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isSecondFactorAuthPassed()) {
      this.authService.repeatSendCode().subscribe(() => {
        this.authService.redirectToEntryPageWithUrl('entry/second-factor-code', state.url);
      });
      return false;
    }
    return true;
  }
}
