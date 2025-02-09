import { Injectable, Provider } from '@angular/core';
import { Observable, of, timer } from 'rxjs';

import { PaymentMethodEnum } from '@pe/checkout/types';

import { ThreatMetrixFlowDetailsInterface } from '../types';

import { BaseThreatMetrixService } from './base-threat-metrix.service';
import { ThreatMetrixService } from './threat-metrix.service';

@Injectable()
export class ThreatMetrixFakeService extends BaseThreatMetrixService {

  private testRequstDuration = 10;
  private triggeredSubmitPaymentRequests: { [key: string]: boolean } = {};

  initFor(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    data: ThreatMetrixFlowDetailsInterface,
  ): Observable<boolean> {
    if (this.isInitializing(flowId, paymentMethod)) {
      return this.initialized$(flowId, paymentMethod);
    }
    else if (!this.isReady(flowId, paymentMethod)) {
      this.setInitializing(flowId, paymentMethod, true);

      return new Observable<boolean>((observer) => {
        timer(this.testRequstDuration).subscribe(() => {
          this.rememberRiskId(flowId, paymentMethod, String(Math.random()).substring(4));
          this.setReady(flowId, paymentMethod, true);
          this.setInitializing(flowId, paymentMethod, false);
          observer.next(true);
        });
      });
    }

    return of(true);
  }

  nodeInitFor(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    data: ThreatMetrixFlowDetailsInterface,
  ): Observable<boolean> {
    return this.initFor(flowId, paymentMethod, data);
  }

  testIsSubmitPayment(flowId: string,
    paymentMethod: PaymentMethodEnum): boolean {
    return !!this.triggeredSubmitPaymentRequests[this.makeKey(flowId, paymentMethod)];
  }

  onSubmitPayment(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    data: ThreatMetrixFlowDetailsInterface,
  ): Observable<void> {
    this.triggeredSubmitPaymentRequests[this.makeKey(flowId, paymentMethod)] = true;

    return of(null);
  }

  static provide(): Provider {
    return {
      provide: ThreatMetrixService,
      useClass: ThreatMetrixFakeService,
    };
  }
}
