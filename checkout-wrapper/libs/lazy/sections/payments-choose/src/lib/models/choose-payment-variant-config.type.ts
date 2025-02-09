import { Type } from '@angular/core';

import { BaseChoosePaymentModule } from '@pe/checkout/payment';
import { PaymentVariantConfig } from '@pe/checkout/types';

export type ChoosePaymentVariantConfig = PaymentVariantConfig<Type<BaseChoosePaymentModule>> ;
