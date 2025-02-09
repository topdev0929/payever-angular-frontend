import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AbstractFinishContainer, AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { ChangePaymentDataInterface } from '@pe/checkout/types';

import { NodePaymentDetailsResponseInterface } from '../../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ivy-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements OnInit, AbstractFinishContainer {

  @Input() showCloseButton: boolean;
  @Input() asSinglePayment = false;

  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  showFinishModalFromExistingPayment(): void {
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().pipe(
      tap(() => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
        this.cdr.markForCheck();
      }),
      catchError((err) => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse();
        if (!this.paymentResponse) {
          this.errorMessage = err.message || 'Unknown error';
        }
        this.cdr.markForCheck();

        return throwError(err);
      }),
    ).subscribe();
  }

  protected paymentCallback(): Observable<void> {
    this.cleanUp();
    this.destroyModal.emit();

    return of(null);
  }
}
