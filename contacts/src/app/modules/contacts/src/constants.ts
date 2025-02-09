import { InjectionToken } from '@angular/core';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
export const PE_CDN_HOST: InjectionToken<string> = new InjectionToken<string>('PE_CDN_HOST');
export const PE_CONTACTS_HOST: InjectionToken<string> = new InjectionToken<string>('PE_CONTACTS_HOST');

export const ITEMS_PER_PAGE: number = 20;

export const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
];
