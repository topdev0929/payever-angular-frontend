import { HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthInterceptor } from '@pe/auth';
import { ResponseErrorsInterface } from '@pe/checkout/types';

@Injectable()
export class StandaloneAuthInterceptor extends AuthInterceptor {

  private readonly router = inject(Router);

  private readonly excludedErrorUrls = [
    this.env.backend.checkoutAnalytics,
  ];

  public override handleError(errorResponse: ResponseErrorsInterface, request: HttpRequest<any>): Observable<never> {
    if ([401, 403].includes(errorResponse.code)
      && !this.excludedErrorUrls.includes(request.url)) {
      return from(
        this.router.navigate(['/pay', 'static-finish', 'fail']),
      ).pipe(
        switchMap(() => throwError(errorResponse.code)),
      );
    }

    return throwError(errorResponse);
  }
}
