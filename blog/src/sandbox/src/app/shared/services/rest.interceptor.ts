import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class RestInterceptor implements HttpInterceptor {

  token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMjY3M2ZhNDUtODJiOS00ODRjLWJjYmUtNDZkYTI1MGMyNjM5IiwiZW1haWwiOiJ0ZXN0Y2FzZXNAcGF5ZXZlci5kZSIsInJvbGVzIjpbeyJwZXJtaXNzaW9ucyI6W10sInRhZ3MiOltdLCJuYW1lIjoibWVyY2hhbnQifV0sInRva2VuSWQiOiI1MzVlMTUwZC04ODAyLTQ4MGMtYWIyOS0zZDM4NDM3NzU0YzEiLCJ0b2tlblR5cGUiOjAsImNsaWVudElkIjpudWxsLCJoYXNoIjoiYmUzMmE3ODgxYzdmZGNlZWRhMTBhMzZiYThmZjI1ZGZhOWU0MzYxNzM1NTcxY2M2NTIxYTIzYjA4MGJlMWNhOSJ9LCJpYXQiOjE1OTY0NTk3MTMsImV4cCI6MTU5NjU0NjExM30.1FDX5zsD_8WgWj_MF3-Rh2MVl0mjbR3Gz5TKhWx_1x4';

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: this.token
      }
    });
    return next.handle(request);
  }
}
