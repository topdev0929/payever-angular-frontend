import { Injectable } from '@angular/core';

import { NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';

@Injectable({
  providedIn: 'root',
})
export class EditTransactionStorageService {

  private transactionData: {[key: string]: NodePaymentResponseInterface<any>} = {};
  private transactionIds: {[key: string]: string} = {};

  saveTransactionData(flowId: string, paymentMethod: PaymentMethodEnum, data: NodePaymentResponseInterface<any>): void {
    const key = this.makeKey(flowId, paymentMethod);
    this.transactionData[key] = data;
  }

  getTransactionData<TransactionDataInterface>(
    flowId: string, paymentMethod: PaymentMethodEnum
  ): NodePaymentResponseInterface<TransactionDataInterface> {
    const key = this.makeKey(flowId, paymentMethod);

    return this.transactionData[key];
  }

  saveTransactionId(flowId: string, paymentMethod: PaymentMethodEnum, transactionId: string): void {
    const key = this.makeKey(flowId, paymentMethod);
    this.transactionIds[key] = transactionId;
  }

  getTransactionId(flowId: string, paymentMethod: PaymentMethodEnum): string {
    const key = this.makeKey(flowId, paymentMethod);

    return this.transactionIds[key];
  }

  private makeKey(flowId: string, paymentMethod: PaymentMethodEnum): string {
    return `${flowId}_${paymentMethod}`;
  }
}
