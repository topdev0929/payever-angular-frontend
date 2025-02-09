import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AuthHeadersEnum } from '../enums';

import { PeAuthService } from './auth.service';
import {
  AuthPlatformService,
  BackdropActionsEnum,
  DashboardEventEnum,
  MicroContainerTypeEnum,
} from './platform.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    public injector: Injector
  ) {
  }

  get authService(): PeAuthService {
    return this.injector.get(PeAuthService);
  }

  get platformService(): AuthPlatformService {
    return this.injector.get(AuthPlatformService);
  }

  // tslint:disable-next-line: cyclomatic-complexity
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let allow403 = false;
    if (request.headers.get(AuthHeadersEnum.allow403)) {
      allow403 = true;
      request = request.clone({
        headers: request.headers.delete(AuthHeadersEnum.allow403),
      });
    }

    if (request.headers.get(AuthHeadersEnum.anonym)) {
      const newRequest: HttpRequest<any> = request.clone({
        headers: request.headers.delete(AuthHeadersEnum.anonym),
      });

      return next.handle(newRequest);
    }

    if (request.headers.get(AuthHeadersEnum.refresh)) {
      const newRequest: HttpRequest<any> = request.clone({
        headers: request.headers.delete(AuthHeadersEnum.refresh),
      });
      const refreshTokenRequest: HttpRequest<any> = this.authService.setTokenHeader(newRequest, this.authService.refreshToken);

      return next.handle(refreshTokenRequest).pipe(
        catchError((err) => {
          if ([401, 403].includes(err.status)) {
            return this.authService.logout().pipe(
              map(() => err),
            );
          }

          return throwError(err);
        }));
    }

    if (!this.authService.isPayeverBackend(request.url)) {
      return next.handle(request);
    }

    let useGuestToken = false;
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
      request = this.authService.setTokenHeader(request, this.authService.guestToken);
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
      request = this.authService.setTokenHeader(request, this.authService.token);
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
          request = this.authService.setTokenHeader(request, this.authService.token);

          return next.handle(request);
        }),
      );
    }

    if (!useGuestToken && this.authService.refreshToken && this.authService.isRefreshTokenExpired()) {
      this.backToDashboard();
    }

    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401 || err.status === 403 && !allow403) {
          return this.authService.logout().pipe(
            map(() => err),
          );
        }

        return throwError(err);
      }),
    );
  }

  backToDashboard(): void {
    this.platformService.dispatchEvent({
      target: DashboardEventEnum.BlurryBackdrop,
      action: BackdropActionsEnum.Hide,
    });

    this.platformService.dispatchEvent({
      target: DashboardEventEnum.MicroContainer,
      action: MicroContainerTypeEnum.InfoBox,
    });

    this.platformService.dispatchEvent({
      target: DashboardEventEnum.DashboardBack,
      action: '',
    });
  }
}
