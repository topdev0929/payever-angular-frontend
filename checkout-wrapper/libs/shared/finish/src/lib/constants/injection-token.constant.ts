import { InjectionToken } from '@angular/core';

export interface FinishStatusIconConfigInterface {
  icons: {
    success: string
    pending: string
    fail: string
  }
  iconsClass: string | string[]
}

export const FinishStatusIconConfig = new InjectionToken<FinishStatusIconConfigInterface>('finish-status-icon-config');
