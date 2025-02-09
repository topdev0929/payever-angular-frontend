import { ComponentRef, EventEmitter } from '@angular/core';
import { tap } from 'rxjs/operators';

import type { OrderComponent } from '@pe/checkout/main/selectors/order';

export const orderInit = (
  componentRef: ComponentRef<OrderComponent>,
  inputs: {
    forceHideQRSwitcher: boolean,
    navigateOnSuccess: boolean,
    referenceEditEnabled: boolean,
    submitSuccess: EventEmitter<any>,
  },
) => {
  const { instance } = componentRef;
  instance.forceHideQRSwitcher = inputs.forceHideQRSwitcher;
  instance.navigateOnSuccess = inputs.navigateOnSuccess;
  instance.referenceEditEnabled = inputs.referenceEditEnabled;
  instance.submitSuccess.pipe(
    tap(e => inputs.submitSuccess.emit(e)),
  ).subscribe();
  componentRef.onDestroy(() => instance.submitSuccess.unsubscribe());
  componentRef.hostView.markForCheck();
};
