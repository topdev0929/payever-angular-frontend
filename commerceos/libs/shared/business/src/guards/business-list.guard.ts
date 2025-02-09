/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PartnerService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessApiService } from '@pe/business';
import { OnboardingService, PluginOnboardingService } from '@pe/shared/onboarding';
import { PeUser, UserState, BusinessesLoaded } from '@pe/user';



@Injectable()
export class BusinessListGuard implements CanActivate {

  @SelectSnapshot(UserState.user) user: PeUser;

  constructor(
    private authService: PeAuthService,
    private api: BusinessApiService,
    private store: Store,
    private router: Router,
    private partnerService: PartnerService,
    private onboardingService: OnboardingService,
    private pluginOnboardingService: PluginOnboardingService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    if (!this.user.hasUnfinishedBusinessRegistration) {
      const invitationRedirectUrl = route.queryParams.invitationRedirectUrl;
      const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;

      return this.api.getBusinessesList('true').pipe(
        switchMap((data) => {
          this.store.dispatch(new BusinessesLoaded(data, true));
          if (!data.total) {
            this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);

            return;
          }
          if (data.businesses.some(x => x.active) && data.total === 1) {
            let business = JSON.parse(localStorage.getItem('pe_active_business')) || data.businesses[0];
            const plugin = route.queryParams['plugin'];

            if (plugin) {
              return this.pluginActions(business._id, plugin).pipe(
                map(() => true)
              );
            }

            if (!business) {
              return this.api.getactiveBusiness().pipe(
                switchMap((res) => {
                  business = res.businesses[0];

                  this.redirectIntoBusiness(business, invitationRedirectUrl);

                  return of(true);
                })
              );
            }
            this.redirectIntoBusiness(business, invitationRedirectUrl);
          }

          return of(true);
        }), catchError(() => {

          this.router.navigate(['login'], queryParams);

          return of(false);
        })
      );
    }
  }

  redirectIntoBusiness(business, invitationRedirectUrl) {
    const re = /:businessId/g;
    this.onboardingService.partnerAfterActions.next({ id: business._id, re });

    const url = `business/${business._id}/info/overview`;
    if (invitationRedirectUrl) {
      this.router.navigate([invitationRedirectUrl, business._id]);
    } else {
      this.router.navigate([url]);
    }
  }

  private pluginActions(businessId: string, plugin: string): Observable<unknown> {
    const partnerData = this.partnerService.getPartnerFromLocalStorage();

    return this.pluginOnboardingService.runAfterPluginActions(partnerData.afterLogin, {
      businessId: businessId,
      integration: plugin,
    });
  }

}
