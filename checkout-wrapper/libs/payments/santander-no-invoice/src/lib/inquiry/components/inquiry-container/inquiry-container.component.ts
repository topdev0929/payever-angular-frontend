import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import {
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  TimestampEvent,
} from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  FormInterface,
  NodePaymentDetailsInterface,
  NodePaymentResponseDetailsInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-invoice-no-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isSendingPayment = false;
  finishModalErrorMessage: string;
  nodeResult: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>;

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  private currencyPipe = this.injector.get(PeCurrencyPipe);
  private submit$ = this.injector.get(PaymentSubmissionService);

  get isPos(): boolean {
    return this.paymentMethod === PaymentMethodEnum.SANTANDER_POS_INVOICE_NO;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.buttonText.next(
      $localize `:@@santander-no-invoice.action.buy_now_for_total:\
        ${this.currencyPipe.transform(this.flow.total, this.flow.currency, 'symbol-narrow', '1.2-2')}:total:`
    );
  }

  onSend(formData: any): void {
    this.sendPaymentData(formData);
  }

  triggerSubmit(): void {
    this.submit$.next();
  }

  protected sendPaymentData(formData: FormInterface): void {

    if (!this.paymentOption) {
      throw new Error('Payment method not presented in list!');
    }
    const nodePaymentDetails: NodePaymentDetailsInterface = prepareData(formData);

    this.nodeFlowService.setPaymentDetails(nodePaymentDetails);

    this.continue.emit();
  }
}
