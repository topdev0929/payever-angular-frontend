import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { EnvironmentConfigService } from '../../../environment-config';
import { AuthService, AuthHeadersEnum } from './auth.service';
import { PlatformService } from '../../../common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    public authService: AuthService,
    public platformService: PlatformService,
    public configService: EnvironmentConfigService) {
  }

  // tslint:disable-next-line: cyclomatic-complexity
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (request.headers.get(AuthHeadersEnum.anonym)) {
      const newRequest: HttpRequest<any> = request.clone({
        headers: request.headers.delete(AuthHeadersEnum.anonym)
      });
      return next.handle(newRequest);
    }

    if (request.headers.get(AuthHeadersEnum.refresh)) {
      const newRequest: HttpRequest<any> = request.clone({
        headers: request.headers.delete(AuthHeadersEnum.refresh)
      });
      const refreshTokenRequest: HttpRequest<any> = this.setTokenHeader(newRequest, this.authService.refreshToken);
      return next.handle(refreshTokenRequest);
    }

    if (!this.authService.isPayeverBackend(request.url)) {
      return next.handle(request);
    }

    let useGuestToken: boolean = false;
    if (
      !request.headers.get('Authorization') &&
      request.url.indexOf('api/refresh') === -1 &&
      this.authService.guestToken &&
      this.authService.isGuestTokenAllowed(request.url) &&
      !this.authService.isGuestTokenExpired()
    ) {
      if (!this.authService.guestToken) {
        console.error('Attempt to set empty bearer guest token', this.authService.guestToken);
      }
      request = this.setTokenHeader(request, this.authService.guestToken);
      useGuestToken = true;
    }

    if (
      !useGuestToken &&
      !request.headers.get('Authorization') &&
      request.url.indexOf('api/refresh') === -1 &&
      this.authService.token &&
      !this.authService.isAccessTokenExpired()
    ) {
      if (!this.authService.token) {
        console.error('Attempt to set empty bearer auth token', this.authService.token);
      }
      request = this.setTokenHeader(request, this.authService.token);
    }

    if (
      !useGuestToken &&
      request.url.indexOf('api/refresh') === -1 &&
      this.authService.isAccessTokenExpired() &&
      this.authService.token
    ) {
      return this.authService.refreshAccessToken$().pipe(
        switchMap(() => {
          if (!this.authService.token) {
            console.error('Attempt to set empty bearer auth token after refresh', this.authService.token);
          }
          request = this.setTokenHeader(request, this.authService.token);
          return next.handle(request);
        })
      );
    }

    if (!useGuestToken && this.authService.refreshToken && this.authService.isRefreshTokenExpired()) {
      this.platformService.backToDashboard();
    }

    return next.handle(request).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        switch (errorResponse.status) {
          // in case if token becomes invalid before expiration time
          case 401:
          case 403:
            if (
              !useGuestToken &&
              this.authService.isPayeverBackend(errorResponse.url) &&
              this.authService.refreshToken &&
              errorResponse.url.indexOf('api/email/') === -1 && // For /api/email/test@test.ru/validate
              errorResponse.url.indexOf('api/login') === -1 &&
              errorResponse.url.indexOf('api/register') === -1 &&
              errorResponse.url.indexOf('api/refresh') === -1
            ) {
              return this.authService.asyncRefreshAccessToken().pipe(
                catchError(error => {
                  // in case if refresh token becomes invalid also
                  if (errorResponse.status === 401 || errorResponse.status === 403) {
                    this.authService.redirectToEntryPage('/entry/login', location.pathname);
                  }
                  return throwError(error);
                }),
                switchMap(() => {
                  if (!this.authService.token) {
                    console.error('Attempt to set empty bearer auth token after async refresh', this.authService.token);
                  }
                  return next.handle(this.setTokenHeader(request, this.authService.token));
                })
              );
            }
            break;
          default:
            break;
        }
        return throwError(errorResponse);
      })
    );
  }

  private setTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    if (!token || token.trim() === '') {
      console.error('Attempt to set empty bearer token', token);
      console.trace();
      // tslint:disable
      debugger;
    }
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

}
