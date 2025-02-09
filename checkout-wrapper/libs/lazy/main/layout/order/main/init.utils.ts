import { ComponentRef, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { FlowInterface } from '@pe/checkout/types';

export const init = (
  componentRef: ComponentRef<any>,
  inputs: {
    asCustomElement: boolean;
    forceHideQRSwitcher: boolean;
    navigateOnSuccess: boolean;
    referenceEditEnabled: boolean;
    submitSuccess: EventEmitter<FlowInterface>;
  },
) => {
  const { instance } = componentRef;
  instance.asCustomElement = inputs.asCustomElement;

  const destroy$ = new Subject<void>();
  instance.forceHideQRSwitcher = inputs.forceHideQRSwitcher;
  instance.navigateOnSuccess = inputs.navigateOnSuccess;
  instance.referenceEditEnabled = inputs.referenceEditEnabled;
  instance.submitSuccess.pipe(
    tap((e) => {
      inputs.submitSuccess.emit(e);
    }),
    takeUntil(destroy$),
  ).subscribe();
  componentRef.hostView.markForCheck();
  componentRef.onDestroy(() => {
    destroy$.next();
    destroy$.complete();
  });

  return instance;
};
