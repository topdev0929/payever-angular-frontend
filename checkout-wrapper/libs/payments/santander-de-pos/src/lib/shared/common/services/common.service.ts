import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, iif, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ParamsState } from '@pe/checkout/store';
import {
  CheckoutStateParamsInterface,
  FlowInterface,
  NodePaymentResponseInterface,
  PaymentSpecificStatusEnum,
} from '@pe/checkout/types';

import {
  DocsManagerService,
  DocumentDataInterface,
  SantanderDePosFlowService,
} from '../services';
import { NodePaymentDetailsResponseInterface } from '../types';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private readonly allowStatusesForDocsSend: PaymentSpecificStatusEnum[] = [
    PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
    PaymentSpecificStatusEnum.STATUS_ENTSCHEIDUNG_NAECHSTER_WERKTAG,
    PaymentSpecificStatusEnum.STATUS_ZURUECKGESTELLT,
  ];

  constructor(
    private santanderDePosFlowService: SantanderDePosFlowService,
    private docsManagerService: DocsManagerService,
  ) {
  }

  @SelectSnapshot(ParamsState)
  private readonly params: CheckoutStateParamsInterface;

  public manageDocument(
    flow: FlowInterface,
    paymentResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>,
  ) {
    const docs: DocumentDataInterface[] = this.docsManagerService
      .getAllDocuments(flow.id);

    return iif(
      () => !docs?.length || !this.allowStatusesForDocsSend.includes(paymentResponse.payment.specificStatus),
      of(paymentResponse),
      this.santanderDePosFlowService.sendDocument(
        paymentResponse.id,
        docs.map(d => ({
          file: d.base64.split(';base64,')[1],
          filename: d.filename,
          documentType: d.documentType,
        })),
      ).pipe(
        map(() => paymentResponse),
        catchError(() => of(paymentResponse))
      )
    );
  }

  removeSignedStatus(
    paymentResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>,
    cancelSigningRequest = true
  ): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    if (this.params.sendingPaymentSigningLink) { return of(paymentResponse) }
    const details = paymentResponse.paymentDetails;

    if (!cancelSigningRequest ||
      ((details.isCustomerSigningTriggered || details.isGuarantorSigningTriggered))
      || ((details.customerSigned || details.guarantorSigned))
    ) {
      return this.santanderDePosFlowService.postPaymentActionSimple<NodePaymentDetailsResponseInterface>(
        'remove-signed-status'
      ).pipe(
        catchError(() => of(paymentResponse)),
      );
    }

    return of(paymentResponse);
  }
}
