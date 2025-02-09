import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';


export const peSkipMediaStorageFlowDataRequestKey = 'peSkipMediaStorageFlowDataRequestKey';

/** @deprecated */
export interface SendToDeviceStorageDataInterfaceSnakeCase {
  flow?: FlowInterface;
  storage?: any;
  code_id?: string; // PIN code for Finish page
  source?: string; // For test
  generate_payment_code?: boolean;
  phoneNumber?: string;
  phone_number?: string;
  force_payment_only?: boolean; // Single payment + open payment step 2. For restore from code for payment widget
  // Single payment + submit on load. For restore from code for payment widget
  force_choose_payment_only_and_submit?: boolean;
  hide_steps_after_choose_payments?: boolean;
  open_next_step_on_init?: boolean;
  force_no_order?: boolean;
  force_no_header?: boolean;
  force_no_send_to_device?: boolean;
  guest_token?: string; // When start flow at one domain and continue at other
  forceHidePreviousSteps?: boolean;
  forceSinglePaymentMethodOnly?: PaymentMethodEnum;
  forceHideShareButton?: boolean;
  forceHideReference?: boolean;
}

const win = window as any;

@Injectable({
  providedIn: 'root',
})
export class SendToDeviceStorage {

  private noCacheHeaders: {[key: string]: string} = {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
  };

  private noCacheRequestOptions = {
    headers: this.noCacheHeaders,
  };

  private httpClient: HttpClient = this.injector.get(HttpClient);
  private env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  constructor(protected injector: Injector) {}

  prapareAndSaveData(data: SendToDeviceStorageDataInterfaceSnakeCase, code: string = null): Observable<string> {
    return this.saveData(data, code);
  }

  getData(code: string): Observable<SendToDeviceStorageDataInterfaceSnakeCase> {
    if (win[peSkipMediaStorageFlowDataRequestKey]) {
      return of(null);
    }

    return this.httpClient.get<{data?: SendToDeviceStorageDataInterfaceSnakeCase}>(
      `${this.env.backend.media}/api/storage/${code}`,
      this.noCacheRequestOptions
    ).pipe(
      map(response => response.data),
      catchError(() => of(null)),
    );
  }

  removeData(code: string): Observable<void> {
    return this.httpClient.delete(
      `${this.env.backend.media}/api/storage/${code}`
    ).pipe(map(() => null));
  }

  setIgnoreGetData(isIgnoreGetData: boolean): void {
    // Flag should be resetted on page refresh
    // Used for optimization - only for case when flow is just created at FE
    win[peSkipMediaStorageFlowDataRequestKey] = isIgnoreGetData;
  }

  makeLink(code: string, channelSetId: string): string {
    return `${this.env.frontend.checkoutWrapper}/${this.localeConstantsService.getLang()}/pay/restore-flow-from-code/${code}?channelSetId=${channelSetId || ''}`;
  }

  private saveData(data: SendToDeviceStorageDataInterfaceSnakeCase, code: string = null): Observable<string> {
    if (data?.flow && data.flow.amount <= 0) {
      // Small hack to prevent validation error when it will try to create flow based on passed data.
      delete data.flow.amount;
    }
    const body = {
      data,
      expiresAt: this.toISOString(new Date(new Date().getTime() + 86400000 * 365)),
    };

    return (code ?
        this.httpClient.put<{id?: string}>(`${this.env.backend.media}/api/storage/${code}`, body) :
        this.httpClient.post<{id?: string}>(`${this.env.backend.media}/api/storage`, body)
    ).pipe(map(res => res.id));
  }

  private toISOString(date: Date): string {
    // We can use Moment().toISOString() here but we don't use to not increase build size (it saves 20kb)
    const pad = (number: number) => number < 10 ? `0${number}` : number;

    return String(date.getUTCFullYear()) +
      '-' + pad(date.getUTCMonth() + 1) +
      '-' + pad(date.getUTCDate()) +
      'T' + pad(date.getUTCHours()) +
      ':' + pad(date.getUTCMinutes()) +
      ':' + pad(date.getUTCSeconds()) +
      '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      'Z';
  }
}
