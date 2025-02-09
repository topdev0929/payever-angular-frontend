import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { Actions, ofActionCompleted } from '@ngxs/store';
import { map } from 'rxjs/operators';

import {
  AbstractFinishContainer,
  AbstractFinishContainerComponent,
} from '@pe/checkout/finish';
import { GetPayment } from '@pe/checkout/store';
import { FlowStateEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements OnInit, AbstractFinishContainer {

  @Output() closeButtonClicked = new EventEmitter<unknown>();

  @Output() finishModalShown = new EventEmitter<boolean>();

  private readonly actions$ = this.injector.get(Actions);

  protected readonly paymentFinishReady$ = this.actions$.pipe(
    ofActionCompleted(GetPayment),
    map(action => action.result.successful)
  );

  protected override showFinishModalFromExistingPayment(): void {
    super.showFinishModalFromExistingPayment();

    if (this.flow.state === FlowStateEnum.FINISH) {
      this.paymentResponse = null;
      this.store.dispatch(new GetPayment());
    }
  }
}
