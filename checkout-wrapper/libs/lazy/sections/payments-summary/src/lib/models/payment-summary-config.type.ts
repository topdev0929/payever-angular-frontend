import { Type } from '@angular/core';

import { BasePaymentSummaryModuleInterface } from '@pe/checkout/payment';
import { PaymentVariantConfig } from '@pe/checkout/types';

export type PaymentSummaryConfig = PaymentVariantConfig<Type<BasePaymentSummaryModuleInterface>>;
