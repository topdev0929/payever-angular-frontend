import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import type { PaymentMethodEnum } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common/core';

import { ApiErrorType } from '../enums';
import { ErrorDetails } from '../interfaces';

import { TrackingService } from './tracking.service';

@Injectable()
export class AbstractApiService {

  protected http = this.injector.get(HttpClient);
  protected env = this.injector.get(PE_ENV);
  protected trackingService = this.injector.get(TrackingService);

  constructor(protected injector: Injector) {}

  protected logError<T>(
    err: T,
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    details: ErrorDetails,
    type: ApiErrorType = null,
  ): Observable<T> {
    this.trackingService?.doEmitApiError(flowId, paymentMethod, type || ApiErrorType.ErrorEvent, details);

    return throwError(err);
  }
}
