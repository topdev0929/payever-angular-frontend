import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    const token = localStorage.getItem('pe_auth_token');
    console.log(token, ';');

    const authReq = req.clone({
      headers: req.headers.set('Authorization', token ),
    });
    console.log(authReq);
    return next.handle(authReq);
  }

  constructor() { }
}
