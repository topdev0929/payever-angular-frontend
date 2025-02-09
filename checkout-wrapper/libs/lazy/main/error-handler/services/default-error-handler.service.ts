import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Store } from '@ngxs/store';

import { FlowState } from '@pe/checkout/store';

import { errorFilters } from '../constants';
import { ERROR_HANDLER_CONFIG } from '../tokens';

@Injectable()
export class DefaultErrorHandlerService implements ErrorHandler {
  private readonly apmService = inject(ApmService);
  private readonly configService = inject(ERROR_HANDLER_CONFIG);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private zone = inject(NgZone);

  handleError(error: any): void {
    const skippedMessage = errorFilters[error?.code] ?? [];

    if (skippedMessage.includes(error.message)) {
      return;
    }

    switch (error?.code) {
      case 401:
      case 403:
        !navigator.cookieEnabled && this.zone.run(() => {
          this.router.navigate(['/pay', 'static-finish', 'fail']);
        });
        break;
      default:
        this.configService.isDebugMode()
          // eslint-disable-next-line no-console
          ? console.error(error)
          : this.captureError(error);

    }
  }

  private captureError(...params: Parameters<typeof this.apmService.apm.captureError>) {
    try {
      const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
      this.apmService.apm.setCustomContext({
        paymentMethod,
      });
    } catch (e) {}
    this.apmService.apm.captureError(...params);
  }
}
