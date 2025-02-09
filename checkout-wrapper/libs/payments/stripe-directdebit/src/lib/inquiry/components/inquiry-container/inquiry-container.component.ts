import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { TimestampEvent } from '@pe/checkout/types';

import {
  BaseContainerComponent,
  FormInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-direct-debit-inquiry-container',
  templateUrl: './inquiry-container.component.html',
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isFinishModalShown = false;
  isSendingPayment = false;
  finishModalErrorMessage: string;

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  private submit$ = this.injector.get(PaymentSubmissionService);

  ngOnInit(): void {
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.buttonText.next($localize `:@@payment-stripeDirectDebit.actions.pay:`);
  }

  triggerSubmit(): void {
    this.submit$.next();
  }

  onSend(formData: FormInterface): void {
    this.sendPaymentData(formData);
  }

  onModalClose(): void {
    this.isFinishModalShown = false;
    this.cdr.markForCheck();
  }

  protected sendPaymentData(formData: FormInterface): void {
    this.isSendingPayment = true;
    this.cdr.markForCheck();
    this.nodeFlowService.setPaymentDetails(formData);

    this.continue.emit();
  }
}
