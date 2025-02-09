import { Injectable } from '@angular/core';

import { TrackingService } from '@pe/checkout/api';
import { PaymentMethodEnum } from '@pe/checkout/types';

@Injectable({
  providedIn: 'root',
})
export class SeTrackingService extends TrackingService {
  doEmitBankIdStepPassed(flowId: string, paymentMethod: PaymentMethodEnum): void {
    this.doEmitEvent(flowId, paymentMethod, 'bank_id_step_passed');
  }
}
