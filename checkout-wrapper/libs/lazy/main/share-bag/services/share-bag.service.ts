import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { FlowStorage, SendToDeviceStorage } from '@pe/checkout/storage';
import { FlowInterface } from '@pe/checkout/types';

import { ShareBagApiService } from './share-bag-api.service';


@Injectable({
  providedIn: 'root',
})
export class ShareBagService {

  private restoreUrlSubject$ = new Subject<string>();
  restoreUrl$ = this.restoreUrlSubject$.asObservable();

  constructor(
    private shareBagApiService: ShareBagApiService,
    private sendToDeviceStorage: SendToDeviceStorage,
    private flowStorage: FlowStorage,
  ) {}

  getQrCode(flow: FlowInterface, openNextStep: boolean, type = 'png'): Observable<string> {
    return this.prepareCode(flow, openNextStep).pipe(
      switchMap(code => this.shareBagApiService.downloadQrCode(code, type)),
    );
  }

  private prepareCode(flow: FlowInterface, openNextStep: boolean): Observable<string> {
    return this.sendToDeviceStorage.prapareAndSaveData({
      flow,
      storage: this.flowStorage.getDump(flow.id),
      generate_payment_code: true,
      source: 'qr',
      forceHideReference: true,
      forceHidePreviousSteps: true,
      forceHideShareButton: true,
      forceSinglePaymentMethodOnly: flow.paymentOptions.find(p =>
        p.connections?.find(c =>
          c.id === flow.connectionId)
        )?.paymentMethod,
      open_next_step_on_init: openNextStep,
    }).pipe(
      map(code => this.sendToDeviceStorage.makeLink(code, flow.channelSetId)),
      tap(url => this.restoreUrlSubject$.next(url)),
    );
  }
}
