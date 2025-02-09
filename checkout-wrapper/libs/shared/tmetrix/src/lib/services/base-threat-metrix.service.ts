import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';

export class BaseThreatMetrixService {

  private riskSessionIds: {[key: string]: string} = {};

  private initializings: {[key: string]: BehaviorSubject<boolean>} = {};
  private readies: {[key: string]: boolean} = {};

  private allowedPayments: { [key in PaymentMethodEnum]?: string } = {
    santander_installment: 'santander-de',
    santander_invoice_de: 'santander-invoice-de',
    santander_pos_invoice_de: 'santander-invoice-de',
    santander_factoring_de: 'santander-factoring-de',
    santander_pos_factoring_de: 'santander-factoring-de',
    zinia_bnpl_de: 'zinia_bnpl_de',
    zinia_bnpl: 'zinia_bnpl',
    zinia_installment: 'zinia_installment',
    zinia_installment_de: 'zinia_installment_de',
    zinia_pos_installment: 'zinia_pos_installment',
    zinia_pos_installment_de: 'zinia_pos_installment_de',
  };

  getLastRiskId(flowId: string, paymentMethod: PaymentMethodEnum): string {
    return this.riskSessionIds[this.makeKey(flowId, paymentMethod)] || null;
  }

  protected isPaymentAllowed(paymentMethod: PaymentMethodEnum): boolean {
    return !!this.allowedPayments[paymentMethod];
  }

  protected isReady(flowId: string, paymentMethod: PaymentMethodEnum): boolean {
    // We have to store in global window object because this service is used by different custom elements
    return !!this.readies[this.makeKey(flowId, paymentMethod)];
  }

  protected setReady(flowId: string, paymentMethod: PaymentMethodEnum, value: boolean): void {
    this.readies[this.makeKey(flowId, paymentMethod)] = value;
  }

  protected isInitializing(flowId: string, paymentMethod: PaymentMethodEnum): boolean {
    const key = this.makeKey(flowId, paymentMethod);

    return !!this.initializings[key] && this.initializings[key].getValue();
  }

  protected initialized$(flowId: string, paymentMethod: PaymentMethodEnum): Observable<boolean> {
    const key = this.makeKey(flowId, paymentMethod);
    if (!!this.initializings[key] && this.initializings[key].getValue()) {
      return this.initializings[key].asObservable().pipe(
        filter(d => !d),
        take(1),
        map(() => this.isReady(flowId, paymentMethod))
      );
    }

    return of(this.isReady(flowId, paymentMethod));
  }

  protected setInitializing(flowId: string, paymentMethod: PaymentMethodEnum, value: boolean): void {
    const key = this.makeKey(flowId, paymentMethod);
    if (!this.initializings[key]) {
      this.initializings[key] = new BehaviorSubject<boolean>(false);
    }
    this.initializings[key].next(value);
  }

  protected rememberRiskId(flowId: string, paymentMethod: PaymentMethodEnum, riskSessionId: string): void {
    this.riskSessionIds[this.makeKey(flowId, paymentMethod)] = riskSessionId; // pe_risksessionid_
  }

  protected makeKey(flowId: string, paymentMethod: PaymentMethodEnum): string {
    return `${flowId}_${paymentMethod}`;
  }
}
