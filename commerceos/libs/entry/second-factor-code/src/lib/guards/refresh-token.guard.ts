import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { AuthTokenPayload, PeAuthService } from '@pe/auth';

@Injectable({ providedIn: 'any' })
export class RefreshTokenGuard  implements CanActivate {
  constructor(
    private router:Router,
    private authService: PeAuthService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const payload: AuthTokenPayload = this.authService.getRefershTokenData();
    if (payload.email) {
        return true;
    }
    const invitationRedirectUrl = route.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;
    this.router.navigate(['login'], queryParams);
  }
}
