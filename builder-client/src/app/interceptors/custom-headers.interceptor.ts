import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { AuthHeadersEnum } from '@pe/ng-kit/modules/auth';

/**
 * This interceptor handles cases which are usually handled bu auth.interceptor.
 * But AuthModule not imported here and auth.interceptor is not applied
 */
@Injectable()
export class CustomHeadersInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.headers.has(AuthHeadersEnum.anonym)) {
      req = req.clone({
        headers: req.headers.delete(AuthHeadersEnum.anonym)
      })
    }
    return next.handle(req);
  }

}
