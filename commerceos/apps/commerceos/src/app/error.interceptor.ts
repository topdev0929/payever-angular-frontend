import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { BusinessAccessOptionsInterface } from '@pe/business';
import {
  EmployeesNotificationService,
} from '@pe/shared/business';
import { BusinessState } from '@pe/user';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  @SelectSnapshot(BusinessState.businessAccessOptions) businessAccessOptions: BusinessAccessOptionsInterface;

  protected router = this.injector.get(Router);
  protected authService = this.injector.get(PeAuthService);
  protected cosEnvService = this.injector.get(CosEnvService);
  protected employeesNotificationService = this.injector.get(EmployeesNotificationService);

  constructor(
    protected injector: Injector,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        // in case if token becomes invalid before expiration time
        if (
          (errorResponse.status === 401 || errorResponse.status === 403)
          && this.authService.isPayeverBackend(errorResponse.url)
          && this.authService.refreshToken
          && errorResponse.url.indexOf('api/email/') === -1 // For /api/email/test@test.ru/validate
          && errorResponse.url.indexOf('api/login') === -1
          && errorResponse.url.indexOf('api/register') === -1
          && errorResponse.url.indexOf('api/refresh') === -1
          && errorResponse.url.indexOf('api/forgot') === -1
          && errorResponse.url.indexOf('api/security-question/validate') === -1
        ) {
          return this.authService.asyncRefreshAccessToken().pipe(
            catchError((error) => {
              // in case if refresh token becomes invalid also
              this.authService.redirectToEntryPage('/entry/login', location.pathname);

              return throwError(error);
            }),
            switchMap(() => {
              if (!this.authService.token) {
                console.error('Attempt to set empty bearer auth token after async refresh', this.authService.token);
              }

              return next.handle(this.authService.setTokenHeader(request, this.authService.token));
            }),
            catchError(error => this.isEmployeePermission403(error)
              ? this.employeesNotificationService.employeeNotification(error)
              : throwError(error)
            ),
          );
        }

        if (this.isEmployeePermission403(errorResponse)) {
          return this.employeesNotificationService.employeeNotification(errorResponse);
        }

        return throwError(errorResponse);
      }),
    );
  }

  isEmployeePermission403(error: HttpErrorResponse) {
    return error.status === 403
      && this.employeesNotificationService.isEmployee(this.businessAccessOptions);
  }
}
