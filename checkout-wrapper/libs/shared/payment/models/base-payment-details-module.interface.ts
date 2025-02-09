import { Type } from '@angular/core';

import { AbstractChoosePaymentContainerInterface } from './abstract-choose-payment-container.interface';
import { AbstractPaymentDetailsContainerInterface } from './abstract-payment-details-container.interface';
import { AbstractPaymentSummaryContainerInterface } from './abstract-payment-summary-container.interface';

export interface BasePaymentDetailsModuleInterface {
  resolvePaymentDetailsStepContainerComponent(): Type<AbstractPaymentDetailsContainerInterface>;
}

export interface BasePaymentSummaryModuleInterface {
  resolvePaymentSummaryStepContainerComponent(): Type<AbstractPaymentSummaryContainerInterface>;
}

export interface BaseChoosePaymentModule {
  resolveChoosePaymentStepContainerComponent(): Type<AbstractChoosePaymentContainerInterface>;
}
