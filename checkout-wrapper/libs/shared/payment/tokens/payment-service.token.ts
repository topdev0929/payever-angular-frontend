import { Directive, InjectionToken, Injector } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { FlowState, SetPaymentService } from '@pe/checkout/store';
import { FlowInterface, NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';

export const ABSTRACT_PAYMENT_SERVICE = new InjectionToken<AbstractPaymentService>('ABSTRACT_PAYMENT_SERVICE');

@Directive()
export abstract class AbstractPaymentService<T = any> {

  @SelectSnapshot(FlowState.flow) protected flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) protected paymentMethod: PaymentMethodEnum;

  abstract postPayment(): Observable<NodePaymentResponseInterface<T> | boolean>;

  protected readonly store = this.injector.get(Store);

  constructor(protected injector: Injector) {
    this.store.dispatch(new SetPaymentService(this));
  }

  public redirect?(): void;
}
