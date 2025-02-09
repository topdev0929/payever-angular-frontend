import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { AuthTokenPayload, PeAuthService } from '@pe/auth';

@Injectable({ providedIn: 'any' })
export class SecurityQuestionGuard  implements CanActivate {
  constructor(
    private router:Router,
    private authService: PeAuthService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isSecurityQuestionDefined: boolean = this.authService.isSecurityQuestionDefined();
    const payload: AuthTokenPayload = this.authService.getRefershTokenData();
    if (payload.email && isSecurityQuestionDefined) {
        return true;
    }

    const invitationRedirectUrl = route.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;
    this.router.navigate(['login'], queryParams);
  }
}
