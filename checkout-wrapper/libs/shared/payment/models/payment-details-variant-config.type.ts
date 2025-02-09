import { Type } from '@angular/core';

import { PaymentVariantConfig } from '@pe/checkout/types';

import { BasePaymentDetailsModuleInterface } from './base-payment-details-module.interface';

export type PaymentDetailsVariantConfig = PaymentVariantConfig<Type<BasePaymentDetailsModuleInterface>> ;
