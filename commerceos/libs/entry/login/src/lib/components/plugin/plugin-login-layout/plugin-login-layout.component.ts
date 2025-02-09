import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { Params } from '@angular/router';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { entryLogo } from '@pe/base';
import { BusinessApiService } from '@pe/business';
import { BusinessesLoaded } from '@pe/user';

import { BaseLoginComponent } from '../../base-login.component';


@Component({
  selector: 'pe-plugin-onboarding',
  templateUrl: './plugin-login-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PluginLoginLayoutComponent extends BaseLoginComponent implements OnInit {
  logo = entryLogo;
  private plugin: string;

  constructor(
    protected injector: Injector,
    private api: BusinessApiService,
    private store: Store,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.plugin = this.route.snapshot.params['plugin'];
  }

  onSuccessLogin(): void {
    const queryParams: Params = this.route.snapshot.queryParams;

    localStorage.removeItem('pe_opened_business');
    localStorage.removeItem('pe_active_business');
    localStorage.removeItem('pe_user_email');

    this.api.getBusinessesList('true').pipe(
      take(1),
      switchMap((data) => {
        this.store.dispatch(new BusinessesLoaded(data, true));
        this.router.navigate([`switcher`], { queryParams: {
          ...queryParams,
          plugin: this.plugin,
        } });

        return of(true);
      }), catchError(() => {
        const industry = this.route.snapshot.params['industry'];
        this.router.navigate(['login', industry, this.plugin], { queryParams });

        return of(false);
      })
    ).subscribe();
  }
}
