import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private peAuthService: PeAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.peAuthService.token || localStorage.getItem('TOKEN');

    if (/payevertesting\.azureedge\.net/.test(req.url)) {
      return next.handle(req);
    } else {
      return next.handle(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    }
  }
}
