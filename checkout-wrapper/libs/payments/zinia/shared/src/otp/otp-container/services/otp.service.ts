import { Injectable, inject } from '@angular/core';

import { FlowInterface } from '@pe/checkout/types';

import { OtpApiService } from './otp-api.service';

@Injectable()
export class OtpService {

  private readonly api = inject(OtpApiService);

  public resendOtpCode(flow: FlowInterface, paymentId: string) {
    return this.api.resendOtpCode(flow.connectionId, paymentId);
  }
}
