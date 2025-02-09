import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiErrorType, ErrorDetails, TrackingService } from '@pe/checkout/api';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

@Injectable()
export class ContractApiService {

  constructor(
    private http: HttpClient,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    protected trackingService: TrackingService
  ) {
  }

  downloadContract(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    paymentId: string,
    businessId: string
  ): Observable<object> {
    const url = `${this.env.thirdParty.payments}/api/download-resource/business/${businessId}/integration/santander_pos_installment/action/contract?paymentId=${paymentId}`;

    return this.http.get(url).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'GET' }))
    );
  }

  private logError<T>(
    err: T,
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    details: ErrorDetails,
    type: ApiErrorType = null,
  ): Observable<T> {
    this.trackingService.doEmitApiError(flowId, paymentMethod, type || ApiErrorType.ErrorEvent, details);

    return throwError(err);
  }

}
