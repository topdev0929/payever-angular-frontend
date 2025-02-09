import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { switchMap } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { PollUpdatePayment } from '@pe/checkout/store';
import { ChangePaymentDataInterface, PaymentStatusEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { NodePaymentDetailsResponseInterface } from '../../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ivy-finish-container',
  templateUrl: './finish-container.component.html',
  providers: [PeDestroyService],
})
export class FinishContainerComponent extends AbstractFinishContainerComponent {

  @Input() showCloseButton: boolean;
  @Input() asSinglePayment = false;

  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  showFinishModalFromExistingPayment(): void {
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().pipe(
      switchMap(() =>
        this.store.dispatch( new PollUpdatePayment(
          Object.values(PaymentStatusEnum).filter(status => 
            status !== PaymentStatusEnum.STATUS_IN_PROCESS &&
            status !== PaymentStatusEnum.STATUS_NEW))
        )
      ),
    ).subscribe(() => {
      this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
      this.cdr.detectChanges();
    }, (err) => {
      this.errorMessage = err.message || 'Unknown error';
      this.cdr.detectChanges();
    });
  }
}
