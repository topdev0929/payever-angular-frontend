import { InjectionToken } from '@angular/core';

import { PaymentVariantConfig } from '@pe/checkout/types';

export const LAZY_PAYMENT_VARIANTS = new InjectionToken<PaymentVariantConfig<any>>('LAZY_PAYMENT_VARIANTS');
