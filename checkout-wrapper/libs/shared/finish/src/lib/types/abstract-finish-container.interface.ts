import { ChangeDetectorRef, EventEmitter } from '@angular/core';

import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

export interface AbstractFinishContainer {
  flow: FlowInterface;
  cdr: ChangeDetectorRef;
  paymentMethod: PaymentMethodEnum;
  merchantMode: boolean;
  embeddedMode: boolean;
  destroyModal: EventEmitter<void>;
}
