import { Inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable()
export class PeMessageAuthInterceptor implements HttpInterceptor {
  constructor(
    private peAuthService: PeAuthService,
    @Inject(PE_ENV) public environmentConfigInterface: EnvironmentConfigInterface
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.peAuthService.token || localStorage.getItem('TOKEN');

    if (req.url.includes(this.environmentConfigInterface.custom.cdn)
      || req.url.includes(this.environmentConfigInterface.custom.translation)) {
      return next.handle(req);
    } else {
      return next.handle(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        }),
      );
    }
  }
}
