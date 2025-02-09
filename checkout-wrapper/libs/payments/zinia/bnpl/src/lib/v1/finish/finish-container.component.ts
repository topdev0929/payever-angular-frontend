import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Actions, ofActionCompleted } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AbstractFinishContainer,
  AbstractFinishContainerComponent,
} from '@pe/checkout/finish';
import { GetPayment } from '@pe/checkout/store';
import { FlowStateEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-bnpl-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements OnInit, AbstractFinishContainer {

  isStatusTimeout = false;

  // For payment widgets when we have many payments in flow but behava like only one
  @Input() isDisableChangePayment = false;
  @Input() showCloseButton: boolean;

  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  private actions$ = this.injector.get(Actions);

  paymentFinishReady$: Observable<boolean> = this.actions$.pipe(
    ofActionCompleted(GetPayment),
    map(action => action.result.successful)
  );

  protected showFinishModalFromExistingPayment(): void {
    super.showFinishModalFromExistingPayment();

    if (this.flow.state === FlowStateEnum.FINISH) {
      this.paymentResponse = null;
      this.store.dispatch(new GetPayment());
    }
  }
}
