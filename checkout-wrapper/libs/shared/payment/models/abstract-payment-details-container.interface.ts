import { ChangeDetectorRef, EventEmitter } from '@angular/core';

import { ChangePaymentDataInterface, FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { AbstractPaymentContainer } from './abstract-payment-container.interface';

export interface AbstractPaymentDetailsContainerInterface extends AbstractPaymentContainer {
  paymentMethod?: PaymentMethodEnum;
  flow?: FlowInterface;
  merchantMode?: boolean;
  embeddedMode?: boolean;
  showCloseButton?: boolean;
  formOptions?: any;
  onShowRatesStepEdit?: EventEmitter<any>;
  changePaymentMethod?: EventEmitter<ChangePaymentDataInterface>;
  closeButtonClicked?: EventEmitter<any>;
  finishModalShown?: EventEmitter<boolean>;
  continue?: EventEmitter<void>;
  cdr?: ChangeDetectorRef;
  forceHideAddressPanel?: boolean;
}
