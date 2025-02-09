import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';

import { BackgroundActivityService } from './background-activity.service';


@Injectable()
export class UploadInterceptorService implements HttpInterceptor {

  constructor(
    private readonly backgroundActivityService: BackgroundActivityService,
    private readonly env: PeAppEnv,
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isApiRequest = request.method !== 'GET' && request.url.indexOf(this.env.builder) !== -1;
    if (isApiRequest || request.body instanceof FormData) {
      this.backgroundActivityService.addTask();

      return next.handle(request).pipe(
        finalize(() => {
          this.backgroundActivityService.removeTask();
        }));
    }

    return next.handle(request);
  }
}
