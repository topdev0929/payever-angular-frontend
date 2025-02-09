import { Injectable, ViewContainerRef, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';

import { VariantErrorComponent } from '../components';

@Injectable()
export class PaymentVariantService {
  handleError(err: Error, containerRef: ViewContainerRef): Observable<MouseEvent> {
    // eslint-disable-next-line
    if (isDevMode()) { console.error(err) };

    const { instance } = containerRef.createComponent(VariantErrorComponent);

    return instance.tryAgain;
  }
}
