import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import {
  ApiService,
  ChannelSetDeviceSettingsInterface,
  VerificationTypeEnum,
} from '@pe/checkout/api';
import { FlowState } from '@pe/checkout/store';
import { PaymentExternalCodeInterface } from '@pe/checkout/types';

export type ExternalCodeViewModel = {
  codeData: PaymentExternalCodeInterface;
  secondFactor: boolean;
  verificationType: VerificationTypeEnum;
}


@Injectable({
  providedIn: 'root',
})
export class ExternalCodeService {

  cache: {
    code?: {
      [flowId: string]: Observable<PaymentExternalCodeInterface>;
    };
    settings?: {
      [flowId: string]: Observable<ChannelSetDeviceSettingsInterface>;
    }
  } = { code: {}, settings: {} };

  constructor(
    private store: Store,
    private apiService: ApiService,
  ) {}

  getViewModel(
    flowId: string,
    secondFactor: boolean,
    verificationType: VerificationTypeEnum,
  ): Observable<ExternalCodeViewModel> {
    return forkJoin([
      this.getCode(flowId),
      secondFactor && verificationType
        ? of({ secondFactor, verificationType })
        : this.getChannelSettings(flowId),
    ]).pipe(
      map(([codeData, { secondFactor, verificationType }]) => ({
        codeData,
        secondFactor,
        verificationType,
      })),
    );
  }

  private getCode(flowId: string): Observable<PaymentExternalCodeInterface> {
    if (!this.cache.code[flowId]) {
      this.cache.code[flowId] = this.apiService.getPaymentExternalCodeByFlowId(flowId).pipe(
        shareReplay(1),
      );
    }

    return this.cache.code[flowId];
  }

  private getChannelSettings(flowId: string): Observable<ChannelSetDeviceSettingsInterface> {
    if (!this.cache.settings[flowId]) {
      this.cache.settings[flowId] = this.store.selectOnce(FlowState.flow).pipe(
        switchMap(({ channelSetId }) => this.apiService.getChannelSetDeviceSettings(channelSetId)),
        shareReplay(1),
      );
    }

    return this.cache.settings[flowId];
  }
}
