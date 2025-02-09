import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';

import { PebIntegrationSnackbarService } from './integration-snackbar.service';

@Injectable({ providedIn: 'any' })
export class PebIntegrationSubscriptionApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly appEnv: PeAppEnv,
    private apmService: ApmService,
    private snackbarService: PebIntegrationSnackbarService,
  ) {
  }

  public getIntegrationSubscriptions(): Observable<any> {
    return this.http
      .get(`${this.appEnv.builder}/api/business/${this.appEnv.business}/subscriptions`)
      .pipe(
        catchError((error) => {
          return throwError(error);
        }));
  }

  public enableIntegrationSubscription(integrationName: string): Observable<any> {
    return this.http
      .patch(`${this.appEnv.builder}/api/business/${this.appEnv.business}/subscriptions/${integrationName}/enable`, {})
      .pipe(
        catchError((error) => {
          this.errorHandler(ErrorsEnum.EnableIntegrationSubscription, error, true);

          return throwError(error);
        }));
  }

  public disableIntegrationSubscription(integrationName: string): Observable<any> {
    return this.http
      .patch(`${this.appEnv.builder}/api/business/${this.appEnv.business}/subscriptions/${integrationName}/disable`, {})
      .pipe(
        catchError((error) => {
          this.errorHandler(ErrorsEnum.DisableIntegrationSubscription, error, true);

          return throwError(error);
        }));
  }

  private errorHandler(description: string, error: any, showWarning?: boolean): void {
    if (showWarning) {
      this.snackbarService.toggle(true, {
        content: description,
        duration: 15000,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }
    this.apmService.apm.captureError(`${description} ms: ${JSON.stringify(error)}`);
  }
}

enum ErrorsEnum {
  GetIntegrationSubscriptions = 'builder-themes.apm_errors.getIntegrationSubscriptions',
  EnableIntegrationSubscription = 'builder-themes.apm_errors.enableIntegrationSubscription',
  DisableIntegrationSubscription = 'builder-themes.apm_errors.disableIntegrationSubscription',
}