import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ParamsState } from '@pe/checkout/store';
import { ThreatMetrixService } from '@pe/checkout/tmetrix';
import { PaymentHelperService } from '@pe/checkout/utils';

import { NodePaymentRequestInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private apiService = this.injector.get(ApiService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private threatMetrixService = this.injector.get(ThreatMetrixService);
  private paymentHelperService = this.injector.get(PaymentHelperService);

  postPayment() {
    const paymentCode$ = this.paymentHelperService.isPos(this.flow)
      ? this.apiService.getChannelSetDeviceSettings(this.flow.channelSetId).pipe(
          catchError(() => of(null)),
        )
      : of(null);

    const params$ = this.store.select(ParamsState.params);

    return paymentCode$.pipe(
      withLatestFrom(params$),
      tap(([paymentCodeSettings, { merchantMode }]) => {
        this.nodeFlowService.assignPaymentDetails({
          shopUserSession: this.flow.shopUserSession,
          posVerifyType: paymentCodeSettings?.enabled ? paymentCodeSettings.verificationType : undefined,
          posMerchantMode: (merchantMode && this.paymentHelperService.isPos(this.flow)) || this.flow.pos_merchant_mode,
          riskSessionId: this.threatMetrixService.getLastRiskId(this.flow.id, this.paymentMethod),
        });
      }),
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentRequestInterface>()),
    );
  }
}
