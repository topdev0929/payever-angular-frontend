import { InjectionToken } from '@angular/core';

export const APP = new InjectionToken<{ channelSet: string }>('APP');
export const THEME = new InjectionToken<any>('THEME');
