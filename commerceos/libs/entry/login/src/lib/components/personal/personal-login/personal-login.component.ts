import { Component, Injector, OnInit } from '@angular/core';
import { Params } from '@angular/router';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessApiService } from '@pe/business';
import { BusinessesLoaded } from '@pe/user';

import { BaseLoginComponent } from '../../base-login.component';


@Component({
  selector: 'pe-personal-login',
  templateUrl: './personal-login.component.html',
  styleUrls: ['./personal-login.component.scss'],
})
export class PersonalLoginComponent extends BaseLoginComponent implements OnInit {

  constructor(
    protected injector: Injector,
    private api: BusinessApiService,
    private authService: PeAuthService,
    private store: Store,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
  }

  onSuccessLogin(): void {
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    let queryParams: Params = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;

    this.api.getBusinessesList('true').pipe(
      take(1),
      switchMap((data) => {
        this.store.dispatch(new BusinessesLoaded(data, true));
        if (!data.total) {
          this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);

          return of(true);
        }
        if (data.businesses.some(x => x.active)) {
          if (data.total === 1) {
            let business = JSON.parse(localStorage.getItem('pe_active_business')) || data.businesses[0];
            if (!business) {
              return this.api.getactiveBusiness().pipe(
                switchMap((res) => {
                  business = res.businesses[0];

                  this.router.navigate([this.returnUrl || `business/${business._id}/info/overview`], queryParams);


                  return of(true);
                })
              );
            }

            this.router.navigate([this.returnUrl || `business/${business._id}/info/overview`], queryParams);
          } else {
            this.router.navigate([this.returnUrl || `switcher`], queryParams);
          }
        } else if (data.businesses.length >= 1) {
          this.router.navigate([`switcher`], queryParams);
        }

        return of(true);
      }), catchError(() => {
        this.router.navigate(['login'], queryParams);

        return of(false);
      })
    ).subscribe();
  }
}
