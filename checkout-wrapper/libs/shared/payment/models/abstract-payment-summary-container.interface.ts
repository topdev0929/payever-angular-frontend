import { ChangeDetectorRef, EventEmitter } from '@angular/core';

import { ModeEnum } from '@pe/checkout/form-utils';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { AbstractPaymentContainer } from './abstract-payment-container.interface';

export interface AbstractPaymentSummaryContainerInterface extends AbstractPaymentContainer {
  flow: FlowInterface;
  paymentMethod: PaymentMethodEnum;
  merchantMode: boolean;
  cdr: ChangeDetectorRef;
  onServiceReady: EventEmitter<boolean>;
  formOptions?: any;
  mode?: ModeEnum;
}
