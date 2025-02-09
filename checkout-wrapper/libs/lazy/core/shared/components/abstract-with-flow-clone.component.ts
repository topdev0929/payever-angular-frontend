import { Directive, EventEmitter, Output } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import {
  FlowInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { PE_ENV } from '@pe/common/core';

import { AbstractFlowIdComponent } from './abstract-flow-id.component';

@Directive() // Has to be here to make work @Input in abstract class
export class AbstractWithFlowCloneComponent extends AbstractFlowIdComponent {

  isChangePaymentMethod = false;
  paymentMethod: PaymentMethodEnum;
  isLoading = false;

  @Output() changePaymentAfterFail: EventEmitter<FlowInterface> = new EventEmitter();

  protected env = this.injector.get(PE_ENV);
  protected loaderService = this.injector.get(LoaderService);

  protected loadPaymentData(): void {
    if (this.paymentMethod && !this.isLoading) {
      this.isLoading = true;
      // We always request flow data before showing step 2
      this.flow$.pipe(
        tap(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

}
