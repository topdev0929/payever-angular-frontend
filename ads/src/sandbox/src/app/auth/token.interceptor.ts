import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import * as Cookie from 'js-cookie';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headers = req.headers.set('Authorization', `Bearer ${Cookie.get('pe_auth_token') || ''}`);
    const authReq = req.clone({ headers });
    return next.handle(authReq);
  }
}
