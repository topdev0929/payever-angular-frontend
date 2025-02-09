import { Component, Inject } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { WidgetTypeEnum } from '@pe/checkout-types';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @LocalStorage() login: string = 'payments.test@payever.org';
  @LocalStorage() password: string = 'Payever123!';

  @LocalStorage() businessId: string = 'c193b0d1-c229-4e4d-9587-1c37233d2ee7';
  @LocalStorage() checkoutUuid: string = '58a380e7-4d1f-50e0-af55-927a727b90e9';

  @LocalStorage() channelSetId: string = '1d802abf-13da-47a4-8b46-02366250c6a9';
  @LocalStorage() type: string = 'button';

  readonly widgetTypes: string[] = Object.values(WidgetTypeEnum);

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private authService: PeAuthService,
    private http: HttpClient,
    private router: Router,
    ) {
  }

  doAuth(): Observable<any> {
    return this.authService.login({
      email: this.login,
      plainPassword: this.password
    }).pipe(
      switchMap(() => this.http.patch<{ accessToken: string; refreshToken: string}>(
        `${this.env.backend.auth}/api/business/${this.businessId}/enable`,
        {},
      ).pipe(
        switchMap(({ accessToken, refreshToken }) => this.authService.setTokens({ accessToken, refreshToken })),
      )),
    );
  }

  openChannels(): void {
    this.doAuth().subscribe(() => {
      this.router.navigate([`/business/${this.businessId}/checkout/${this.checkoutUuid}/panel-channels`]);
      // window.location.href = `/business/${this.businessId}/checkout/${this.checkoutUuid}/panel-channels`;
    });
  }

  openFinExpWidget(): void {
    // We test widget with empty tokens
    this.authService.setTokens({accessToken: '', refreshToken: ''}).subscribe(() => {
      window.location.href = `finexp-widget-test/channelSetId/${this.channelSetId}/type/${this.type}`;
    });
  }
}
