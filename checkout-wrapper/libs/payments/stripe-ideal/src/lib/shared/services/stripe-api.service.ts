import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AbstractApiService } from '@pe/checkout/api';
import { PaymentMethodEnum, NodePaymentPreInitializeData, NodePaymentInterface } from '@pe/checkout/types';

@Injectable()
export class StripeApiService extends AbstractApiService {

  paymentPublishKey(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
  ): Observable<NodePaymentPreInitializeData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-publish-key`;
    const data = {
      amount: nodeData.payment.amount,
      deliveryFee: nodeData.payment.deliveryFee,
    };

    return this.http.post<NodePaymentPreInitializeData>(url, data).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }
}
