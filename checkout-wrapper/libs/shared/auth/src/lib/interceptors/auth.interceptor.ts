import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { BYPASS_AUTH } from '@pe/checkout/api';
import { AuthSelectors, RefreshToken } from '@pe/checkout/store/auth';
import { ResponseErrorsInterface } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  protected readonly store = inject(Store);
  protected readonly env = inject(PE_ENV);

  @SelectSnapshot(AuthSelectors.accessToken)
  protected token: string;

  @SelectSnapshot(AuthSelectors.refreshToken)
  protected refreshToken: string;

  private readonly excludedUrls = [
    'api.stripe.com/v1/tokens',
    'MICRO_URL_CUSTOM_CDN',
    'MICRO_URL_CHECKOUT_CDN',
    this.env.custom.cdn,
  ];

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method === 'JSONP'
      || this.excludedUrls.some(url => request.url.includes(url))
      || request.context.get(BYPASS_AUTH)
    ) {
      return next.handle(request);
    }

    return next.handle(this.setTokenHeader(request, this.token)).pipe(
      catchError((error) => {
        switch (error.status || error.code) {
          case 401:
          case 403:
            if (this.refreshToken && !request.context.get(BYPASS_AUTH)) {

              return this.store.dispatch(new RefreshToken(this.refreshToken)).pipe(
                switchMap(() => next.handle(this.setTokenHeader(request, this.token))),
                catchError(error => this.handleError(error)),
              );
            }
            break;
          default:
            break;
        }

        return this.handleError(error, request);
      }),
    );
  }

  public handleError(errorResponse: ResponseErrorsInterface, request?: HttpRequest<any>) {
    return throwError(errorResponse);
  }

  private setTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
