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
    private httpClient: HttpClient,
    private checkoutApiService: CheckoutApiService,
    @Inject(PE_ENV) private env: EnvInterface,
  ) {}

  getRates(
    channelSet: string,
    payment: PaymentMethodEnum,
    isBNPL: boolean,
    amount: number,
    widgetType: WidgetTypeEnum,
  ): Observable<CheckoutAndCreditsInterface<CreditInterface>> {
    return combineLatest([
      this.checkoutApiService.getDefaultConnections(channelSet, payment),
      this.checkoutApiService.getCheckoutSettings(channelSet),
    ]).pipe(
      mergeMap((data) => {
        const params: {[param: string]: string} = {
          widgetType,
          amount: String(amount),
          paymentOption: payment,
          connectionId: data[0]._id,
        };

        return this.httpClient.post<RawRatesResponseInterface>(
          `${this.env.backend.webWidgets}/api/app/finance-express/business/${data[1].businessUuid}/client-action/calculate-rates`,
          params
        ).pipe(
          map((resp) => {
          let credits: CreditInterface[] = resp.credit.filter(a => a.isFixedAmount);
          if (isBNPL) {
            credits = resp.credit.filter(a => !a.isFixedAmount);
            credits.forEach((c) => {
              const parsed = this.parseBnplDescription(c.description);
              c.duration = parsed[0];
              c.creditPurchase = amount + parsed[1];
            });
            credits = credits.filter(a => a.duration && a.creditPurchase);
          }

          return {
            currency: data[1].currency,
            rates: credits,
          };
      }));
    }));
  }

  private parseBnplDescription(line: string): number[] {
    return line.replace(/[a-z]/gi, '').replace(/\s/g, '').split(',').map(parseFloat);
  }

}
