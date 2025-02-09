import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, shareReplay } from 'rxjs/operators';

import { CheckoutSettingsInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';


interface DefaultConnectionInterface {
  _id: string;
}

@Injectable()
export class CheckoutApiService {

  private checkoutSettings: { [key: string]: Observable<CheckoutSettingsInterface> } = {};
  private defaultConnections: { [key: string]: Observable<DefaultConnectionInterface> } = {};

  constructor(
    private httpClient: HttpClient,
    @Inject(PE_ENV) private env: EnvInterface,
  ) {}

  getCheckoutSettings(channelSetId: string): Observable<CheckoutSettingsInterface> {
    if (!this.checkoutSettings[channelSetId]) {
      this.checkoutSettings[channelSetId] = this.fetchCheckoutSettings(channelSetId).pipe(
        filter(settings => !!settings),
        catchError((err) => {
          this.checkoutSettings[channelSetId] = null;

          return throwError(new Error(
            `Checkout settings request: ${err?.error?.message || err.message || 'Unknown error'}`
          ));
        }),
        shareReplay(1),
      );
    }

    return this.checkoutSettings[channelSetId];
  }

  getDefaultConnections(channelSetId: string, payment: PaymentMethodEnum): Observable<DefaultConnectionInterface> {
    const key = `${channelSetId}|${payment}`;

    if (!this.defaultConnections[key]) {
      this.defaultConnections[key] = this.fetchDefaultConnections(
        channelSetId,
        payment,
      ).pipe(
        filter(connection => !!connection),
        catchError((err) => {
          this.checkoutSettings[channelSetId] = null;

          return throwError(new Error(
            `Default connection request: ${err?.error?.message || err?.message || 'Unknown error'}`
          ));
        }),
        shareReplay(1),
      );
    }

    return this.defaultConnections[key];
  }

  private fetchCheckoutSettings(
    channelSetId: string,
  ): Observable<CheckoutSettingsInterface> {
    return this.httpClient.get<CheckoutSettingsInterface>(
      `${this.env.backend.checkout}/api/checkout/channel-set/${channelSetId}/full-settings`
    );
  }

  private fetchDefaultConnections(
    channelSetId: string,
    payment: PaymentMethodEnum,
  ): Observable<DefaultConnectionInterface> {
    return this.httpClient.get<DefaultConnectionInterface>(
      `${this.env.backend.checkout}/api/channel-set/${channelSetId}/default-connection/${payment}`
    );
  }
}
