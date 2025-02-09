import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { AbstractPaymentService } from '@pe/checkout/payment';
import { NodePaymentResponseInterface } from '@pe/checkout/types';


@Injectable({
  providedIn: 'root',
})
export class PaymentProxyService {

  private paymentService: AbstractPaymentService;

  public setPaymentService(paymentService: AbstractPaymentService): void {
    this.paymentService = paymentService;
  }

  public postPayment(): Observable<NodePaymentResponseInterface<any> | boolean> {
    return this.paymentService.postPayment();
  }

  public redirect(): void {
    this.paymentService.redirect?.();
  }
}
