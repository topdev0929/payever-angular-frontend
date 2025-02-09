import { Directive, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Directive()
export abstract class BaseLoginComponent {
  protected returnUrl: string;

  protected router = this.injector.get(Router);
  protected route = this.injector.get(ActivatedRoute);

  public abstract onSuccessLogin(): void;

  constructor(
    protected injector: Injector,
  ) {}

  onSecondFactorCode(): void {
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } }
      : { queryParams: { returnUrl: this.returnUrl } };
    this.router.navigate(['second-factor-code'], queryParams);
  }

  onRegister(): void {
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;
    this.router.navigate(['registration'], queryParams);
  }
}
