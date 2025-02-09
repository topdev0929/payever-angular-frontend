import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import {
  CheckoutApiService,
} from '@pe/checkout/payment-widgets';
import {
  CheckoutAndCreditsInterface,
  WidgetTypeEnum,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { CreditInterface, RawRatesResponseInterface } from '../models';


@Injectable()
export class WidgetsApiService {

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private httpClient: HttpClient,
    private checkoutApiService: CheckoutApiService,
  ) {}

  getRates(
    channelSet: string,
    payment: PaymentMethodEnum,
    amount: number,
    widgetType: WidgetTypeEnum,
  ): Observable<CheckoutAndCreditsInterface<CreditInterface>> {
    return combineLatest([
      this.checkoutApiService.getDefaultConnections(channelSet, payment),
      this.checkoutApiService.getCheckoutSettings(channelSet),
    ]).pipe(
      mergeMap((data) => {
        const params: {[param: string]: string | boolean} = {
          amount: String(amount),
          widgetType,
          paymentOption: payment,
          connectionId: data[0]._id,
          cpi: false,
        };

        return this.httpClient.post<RawRatesResponseInterface>(
          `${this.env.backend.webWidgets}/api/app/finance-express/business/${data[1].businessUuid}/client-action/calculate-rates`,
          params
        ).pipe(
          map(resp => ({
            currency: data[1].currency,
            rates: resp.credit,
          })),
        );
      }),
    );
  }

}
