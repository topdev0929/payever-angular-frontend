import {
  Component,
  ChangeDetectionStrategy,
  Input,
  inject,
} from '@angular/core';
import { Actions, ofActionCompleted } from '@ngxs/store';
import { map, tap } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { SetPaymentError, UpdatePayment } from '@pe/checkout/store';

import { NodePaymentDetailsResponseInterface } from '../../../shared/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'sofort-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
})
export class FinishContainerComponent extends AbstractFinishContainerComponent {
  actions$ = inject(Actions);

  @Input() asSinglePayment = false;

  showFinish$ = this.actions$.pipe(
    ofActionCompleted(UpdatePayment, SetPaymentError),
    map(() => !this.topLocationService.isRedirecting)
  );

  showFinishModalFromExistingPayment(): void {
    this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().pipe(
      tap(() => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
        this.cdr.detectChanges();
      }, (err) => {
        this.errorMessage = err.message || 'Unknown error';
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }
}
