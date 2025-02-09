import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  CheckoutInterface,
  CheckoutSettingsInterface,
  EnvironmentConfigInterface,
  PE_ENV,
  EnvService,
} from '@pe/common';

export const CHANNEL_SET_ID = new InjectionToken<string>('CHANNEL_SET_ID');

@Injectable()
export class CheckoutSharedService {

  defaultLocale = 'en';

  locale$ = defer(() =>  this.getCheckoutSettings().pipe(
    catchError(() => of(null)),
    map(settings => settings?.languages.find(l => l.isDefault)?.code || this.defaultLocale),
  ));

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    @Optional() @Inject(CHANNEL_SET_ID) private channelSetId: string,
    @Optional() private envService: EnvService,
    private http: HttpClient,
  ) {
  }

  getLocale(channelSetId: string): Observable<string> {
    return this.getCheckoutSettings(channelSetId).pipe(
      catchError(() => of(null)),
      map(settings => settings?.languages.find(l => l.isDefault)?.code || this.defaultLocale),
    );
  }

  private getCheckoutSettings(channelSetId?: string): Observable<CheckoutSettingsInterface> {
    return this.envService && !this.channelSetId && !channelSetId
      ? this.getCheckoutSettingsByBusinessId()
      : this.getCheckoutSettingsByChannelSetId((this.channelSetId || channelSetId) ?? '');
  }

  private getCheckoutSettingsByBusinessId(): Observable<CheckoutSettingsInterface> {
    return this.getCheckouts().pipe(
      map(checkouts => checkouts.find(checkout => checkout.default)?.settings ?? { languages: [] }),
    );
  }

  private getCheckoutSettingsByChannelSetId(channelSetId: string): Observable<CheckoutSettingsInterface> {
    return this.http.get<CheckoutSettingsInterface>(
      `${this.env.backend.checkout}/api/checkout/channel-set/${channelSetId}/base-settings`
    );
  }

  private getCheckouts(): Observable<CheckoutInterface[]> {
    return this.http.get<CheckoutInterface[]>(
      `${this.env.backend.checkout}/api/business/${this.envService.businessId}/checkout`,
    );
  }
}
