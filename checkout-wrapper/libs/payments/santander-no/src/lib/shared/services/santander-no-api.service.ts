import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import { NodePaymentInterface, NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';

@Injectable({
  providedIn: 'root',
})
export class SantanderNoApiService extends AbstractApiService {

  postMoreInfo<PaymentResponseDetails>(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    paymentId: string,
    nodeData: NodePaymentInterface<PaymentResponseDetails>,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/more-info`;
    const flowId = nodeData.payment.flowId;

    return this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(
      url,
      { ...nodeData.paymentDetails, paymentId },
    ).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorSubmit)),
    );
  }
}
