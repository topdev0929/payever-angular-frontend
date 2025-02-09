import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThirdPartyFormServiceInterface, InfoBoxSettingsInterface, InfoBoxSettingsInFormInterface } from '../../../../../kit/third-party-form';

const stripeConnected: InfoBoxSettingsInterface = require('./stripe-connected.json');

export class ThirdPartyFormStripeStubService implements ThirdPartyFormServiceInterface {

  constructor(private testCategoryName: string) {}

  requestInitialForm(): Observable<InfoBoxSettingsInFormInterface> {
    return this.ret(stripeConnected);
  }

  executeAction(action: string, data: {}): Observable<InfoBoxSettingsInFormInterface> {
    
    return this.ret(stripeConnected);
  }

  getActionUrl(action: string): string {
    return '/';
  }

  prepareUrl(url: string): string {
    return url;
  }

  allowCustomActions(): boolean {
    return false;
  }

  allowDownload(): boolean {
    return true;
  }

  private readonly ret: (data: any) => Observable<InfoBoxSettingsInFormInterface> = (data: any) => {
    return timer(1200).pipe(map(a => data));
  }
}
