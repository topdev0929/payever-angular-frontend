import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { PaymentState } from '@pe/checkout/store';
import {
  AnalyzedDocumentsData,
  AnalyzeDocument,
  NodePaymentResponseInterface,
  SendDocument,
} from '@pe/checkout/types';

import { SantanderDePosApiService } from './santander-de-pos-api.service';

@Injectable({
  providedIn: 'root',
})
export class SantanderDePosFlowService extends BaseNodeFlowService {
  private santanderDePosApiService = this.injector.get(SantanderDePosApiService);
  private store = this.injector.get(Store);

  postPaymentActionSimple<PaymentResponseDetails>(
    actionName: string,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    return this.store.selectOnce(PaymentState.response).pipe(
      switchMap(response => this.santanderDePosApiService.postPaymentActionSimple<PaymentResponseDetails>(
        this.flow.id,
        this.paymentMethod,
        this.flow.connectionId,
        actionName,
        response.id,
      ))
    );
  }

  analyzeDocuments(
    docs: AnalyzeDocument[],
  ): Observable<AnalyzedDocumentsData> {
    return this.santanderDePosApiService.analyzeDocuments(
      docs,
      this.flow.id,
      this.paymentMethod,
      this.flow.connectionId,
    );
  }

  sendDocument(
    paymentId: string,
    documents: SendDocument[],
  ): Observable<any> {
    return this.santanderDePosApiService.sendDocuments(
      paymentId,
      documents,
      this.flow.id,
      this.paymentMethod,
      this.flow.connectionId,
    );
  }
}
