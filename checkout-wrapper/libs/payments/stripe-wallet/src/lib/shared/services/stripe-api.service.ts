import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AbstractApiService } from '@pe/checkout/api';
import { PaymentMethodEnum, NodePaymentPreInitializeData, NodePaymentInterface } from '@pe/checkout/types';

@Injectable({
  providedIn: 'root',
})
export class StripeApiService extends AbstractApiService {

  paymentPreInitialize(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
  ): Observable<NodePaymentPreInitializeData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/payment-pre-initialize`;

    const data = {
      amount: nodeData.payment.amount,
      deliveryFee: nodeData.payment.deliveryFee,
    };

    return this.http.post<NodePaymentPreInitializeData>(url, data).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }
}
