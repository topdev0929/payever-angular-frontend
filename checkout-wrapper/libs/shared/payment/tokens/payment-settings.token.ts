import { InjectionToken } from '@angular/core';

import { PaymentSettings } from '../models';

export const PAYMENT_SETTINGS = new InjectionToken<PaymentSettings>('PAYMENT_SETTINGS');
