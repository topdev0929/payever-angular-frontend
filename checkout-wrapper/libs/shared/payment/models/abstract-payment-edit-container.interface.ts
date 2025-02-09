import { ChangeDetectorRef, EventEmitter } from '@angular/core';

import { ModeEnum } from '@pe/checkout/form-utils';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { AbstractPaymentContainer } from './abstract-payment-container.interface';

export interface AbstractPaymentEditContainerInterface extends AbstractPaymentContainer {
  flow: FlowInterface;
  paymentMethod: PaymentMethodEnum;
  merchantMode: boolean;
  embeddedMode: boolean;
  cdr: ChangeDetectorRef;
  finishModalShown: EventEmitter<boolean>;
  continue: EventEmitter<void>;
  mode?: ModeEnum;
}
