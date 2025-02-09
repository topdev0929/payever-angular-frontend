import { Directive, EventEmitter, Output } from '@angular/core';
import { Actions, ofActionDispatched, ofActionSuccessful } from '@ngxs/store';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import { SetPaymentComplete, SubmitPayment } from '@pe/checkout/store';

@Directive()
export class BaseEditContainerComponent extends AbstractPaymentContainerComponent {

  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  protected actions$ = this.injector.get(Actions);

  isLoading$ = merge(
    this.actions$.pipe(
      ofActionDispatched(SubmitPayment),
      map(() => true),
    ),
    this.actions$.pipe(
      ofActionSuccessful(SetPaymentComplete),
      map(() => false),
    )
  );
}
