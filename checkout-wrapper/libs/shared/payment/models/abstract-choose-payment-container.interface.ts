import { ChangeDetectorRef, EventEmitter } from '@angular/core';

import {
  ChangePaymentDataInterface,
  FlowInterface,
  PaymentMethodEnum,
  RateSummaryInterface,
  TimestampEvent,
} from '@pe/checkout/types';

import { AbstractPaymentContainer } from './abstract-payment-container.interface';

export interface AbstractChoosePaymentContainerInterface extends AbstractPaymentContainer {
  flow: FlowInterface;
  paymentMethod: PaymentMethodEnum;
  merchantMode: boolean;
  embeddedMode: boolean;
  cdr: ChangeDetectorRef;
  formOptions?: any;
  continue: EventEmitter<TimestampEvent>;
  buttonText: EventEmitter<string>;
  serviceReady?: EventEmitter<boolean>;
  buttonHidden?: EventEmitter<boolean>;
  ratesLoading?: EventEmitter<boolean>;
  loading?: EventEmitter<boolean>;
  fullWidthMode?: EventEmitter<boolean>;
  selectRate?: EventEmitter<RateSummaryInterface>;
  changePaymentMethod?: EventEmitter<ChangePaymentDataInterface>;
  finishModalShown?: EventEmitter<boolean>;
  triggerSubmit(): void;
}

export interface AbstractChoosePaymentComponent {
  flowId: string;
  paymentMethod: PaymentMethodEnum;
}
