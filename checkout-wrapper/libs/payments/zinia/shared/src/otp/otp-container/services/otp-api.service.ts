import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { PE_ENV } from '@pe/common';

@Injectable({
  providedIn: 'root',
})
export class OtpApiService {

  private readonly http = inject(HttpClient);
  private readonly env = inject(PE_ENV);

  public resendOtpCode(connectionId: string, paymentId: string) {
    return this.http.post<void>(
      `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/resend-otp`,
      { paymentId },
    );
  }
}
