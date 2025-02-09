import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import {
  TimestampEvent,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import {
  BaseContainerComponent,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-inquiry-container',
  templateUrl: './inquiry-container.component.html',
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isFinishModalShown = false;
  finishModalErrorMessage: string;

  @Output() continue = new EventEmitter<TimestampEvent>();
  @Output() buttonText = new EventEmitter<string>();
  @Output() loading = new EventEmitter<boolean>();

  protected localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);
  private submit$ = this.injector.get(PaymentSubmissionService);

  ngOnInit(): void {
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.buttonText.next($localize `:@@payment-stripe.actions.pay:`);
  }

  triggerSubmit(): void {
    this.submit$.next();
  }

  onSend(): void {
    this.sendPaymentData();
  }


  onModalClose(): void {
    this.isFinishModalShown = false;
  }

  public onLoading(value: boolean): void {
    this.loading.emit(value);
  }

  protected sendPaymentData(): void {
    this.continue.emit();
  }
}
