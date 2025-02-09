import { InjectionToken } from '@angular/core';

export interface LazyPaymentSectionsInterface {
  [key: string]: () => Promise<any>;
}

export const LAZY_PAYMENT_SECTIONS = new InjectionToken<LazyPaymentSectionsInterface>('LAZY_PAYMENT_SECTIONS');
