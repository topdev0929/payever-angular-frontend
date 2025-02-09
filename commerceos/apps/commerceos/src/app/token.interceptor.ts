import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';

// TODO: this interceptor is to remove tokens when requesting an asset.
// need remove the matIconSvg in filters (pe-data-grid)
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: PeAuthService,
  ) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.split('/')?.includes('assets')) {
        req = req.clone({ headers: req.headers.delete('Authorization') });
    }

    if (
      req.url?.includes('/api/security-question/question')
      || req.url?.includes('/api/security-question/validate')
    ) {
      req = req.clone({ headers: req.headers.delete('Authorization') });

      return next.handle(this.authService.setTokenHeader(req, this.authService.refreshToken));
    }

    return next.handle(req);
  }
}
