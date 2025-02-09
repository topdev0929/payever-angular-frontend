import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface } from '@pe/common';

import { AnalyticFormStatusEnum, ConsentActionsInterface, FormActionsInterface } from '../core';
import { getBrowserInfo } from '../core/utils';

@Injectable({
  providedIn: 'root',
})
export class AnalyticApiService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private httpClient: HttpClient,
  ) { }

  doEmitEventFormInit(flowId: string, businessId: string): void {
    const payload = {
      paymentFlowId: flowId,
      businessId,
      ...getBrowserInfo(),
    };


    this.httpClient.post(
      `${this.env.backend.checkoutAnalytics}/api/event/form/init`,
      payload,
    ).pipe(
      catchError(() => EMPTY),
    ).subscribe();
  }

  doEmitEventForm(
    flowId: string,
    businessId: string,
    paymentMethod: string,
    details: FormActionsInterface | ConsentActionsInterface,
  ): void {
    const payload = {
      paymentFlowId: flowId,
      paymentMethod,
      businessId,
      ...details,
    };

    this.httpClient.post(
      `${this.env.backend.checkoutAnalytics}/api/event/form`,
      payload,
    ).pipe(
      catchError(() => EMPTY),
    ).subscribe();
  }

  doEmitEventFormItself(
    flowId: string,
    businessId: string,
    paymentMethod: string,
    name: string,
    status: AnalyticFormStatusEnum,
  ): void {
    const payload = {
      paymentFlowId: flowId,
      paymentMethod: paymentMethod,
      businessId: businessId,
      name,
      status,
    };

    this.httpClient.post(
      `${this.env.backend.checkoutAnalytics}/api/event/form/itself`,
      payload,
    ).pipe(
      catchError(() => EMPTY),
    ).subscribe();
  }
}
