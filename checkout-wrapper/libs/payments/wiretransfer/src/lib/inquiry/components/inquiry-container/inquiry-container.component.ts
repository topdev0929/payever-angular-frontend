import {
  Component,
  ChangeDetectionStrategy,
  Output,
  OnInit,
  EventEmitter,
} from '@angular/core';

import { TimestampEvent } from '@pe/checkout/types';

import { BaseContainerComponent } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wiretransfer-inquiry-container',
  templateUrl: './inquiry-container.component.html',
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isFinishModalShown = false;
  isSendingPayment = false;
  finishModalErrorMessage: string;

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  ngOnInit(): void {
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.buttonText.next($localize `:@@payment-wiretransfer.actions.pay_now:`);
  }

  triggerSubmit(): void {
    this.continue.emit();
  }
}
