import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder/core';

import { PeAppointmentsRequestsErrorsEnum } from '../enums';
import { PeAppointmentsNetworkAccessInterface } from '../interfaces';
import { PE_ACCESS_API_PATH } from '../tokens';

import { PeErrorsHandlerService } from './errors-handler.service';

@Injectable()
export class PeAppointmentsAccessApiService {

  constructor(
    private httpClient: HttpClient,

    private pebEnvService: PebEnvService,

    @Inject(PE_ACCESS_API_PATH) private peAccessApiPath: string,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get networkAccessPath(): string {
    return `${this.peAccessApiPath}/api/business/${this.pebEnvService.businessId}/appointment-network/access`;
  }

  public getAccessConfig(networkId: string): Observable<any> {
    return this.httpClient
      .get(`${this.networkAccessPath}/${networkId}`)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetAccessConfig, error, true);

          return throwError(error);
        }));
  }

  public getLiveStatus(networkId: string): Observable<any> {
    return this.httpClient
      .get(`${this.networkAccessPath}/${networkId}/is-live`)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetLiveStatus, error, true);

          return throwError(error);
        }));
  }

  public updateAccessConfig(
    networkId: string,
    configId: string,
    accessConfig: PeAppointmentsNetworkAccessInterface,
  ): Observable<any> {
    return this.httpClient
      .patch(`${this.networkAccessPath}/${networkId}/${configId}`, accessConfig)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.UpdateAccessConfig, error, true);

          return throwError(error);
        }));
  }
}
