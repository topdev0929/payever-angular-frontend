import { Type } from '@angular/core';

import { BasePaymentEditModule } from '@pe/checkout/payment';
import { PaymentVariantConfig } from '@pe/checkout/types';

export type PaymentEditConfig = PaymentVariantConfig<Type<BasePaymentEditModule>>;
