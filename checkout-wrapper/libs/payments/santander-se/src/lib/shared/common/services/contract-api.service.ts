import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TrackingService, ApiErrorType, ErrorDetails } from '@pe/checkout/api';
import { PaymentInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

@Injectable()
export class ContractApiService {

  constructor(
    private http: HttpClient,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    protected trackingService: TrackingService
  ) {
  }

  doSignContract(flowId: string, paymentMethod: PaymentMethodEnum, payment: PaymentInterface): Observable<object> {
    const url = `${this.env.backend.payments}/api/rest/v1/checkout/sign-contract/${payment.id}`;

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
