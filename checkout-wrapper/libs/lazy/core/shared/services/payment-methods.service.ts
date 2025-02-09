import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  CheckoutState,
} from '@pe/checkout/store';
import {
  FlowInterface,
  PaymentOptionInterface,
  ViewPaymentOption,
} from '@pe/checkout/types';
import { PAYMENT_TRANSLATIONS } from '@pe/checkout/utils';

/**
 * @deprecated Create a single service for handling ChoosePaymentView
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentMethodsService {

  cache: { [flowId: string]: Observable<PaymentOptionInterface[]> } = {};

  constructor(private store: Store) {}

  getViewPaymentOptions(flow: FlowInterface): Observable<ViewPaymentOption[]> {
    return this.store.select(CheckoutState.paymentOptions).pipe(
      filter(options => !!options),
      map(options => this.mapToViewPaymentOptions(options, flow.amount)),
    );
  }

  private mapToViewPaymentOptions(options: PaymentOptionInterface[], amount: number): ViewPaymentOption[] {
    return options.reduce((acc, curr) => {
      curr.connections.forEach((c) => {
        const { connections, ...payment } = curr;

        const min = c.min ?? curr.min;
        const max = c.max ?? curr.max;

        if (amount > min || amount < max) {
          acc.push({
            ...payment,
            id: c.id,
            merchantCoversFee: c.merchantCoversFee,
            connectionName: c.name,
            version: c.version,
            label: c.default || !c?.name
              ? PAYMENT_TRANSLATIONS[curr.paymentMethod]
              : c.name,
            showFee: (!payment.acceptFee || !c.merchantCoversFee) && (curr.fixedFee > 0 || curr.variableFee > 0),
          });
        }

      });

      return acc;
    }, [] as ViewPaymentOption[]);
  }
}
