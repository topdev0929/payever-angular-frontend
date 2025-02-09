import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { BaseFinishStatusComponent } from '../base-finish-status.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-finish-status-unknown',
  templateUrl: './finish-status-unknown.component.html',
  styleUrls: ['./finish-status-unknown.component.scss'],
})
export class FinishStatusUnknownComponent extends BaseFinishStatusComponent {
  @Input() orderId: string = null;
  @Input() nodeResult: NodePaymentResponseInterface<any> = null;

  prepareTranslations(applicationNumber: string, transactionLink: string, transactionNumber: string) {
    this.translations = {
      applicationNumber: $localize `:@@checkout_sdk.finish_status_unknown.application_number:${applicationNumber}:applicationNumber:`,
      transactionDetails: $localize `:@@checkout_sdk.finish_status_unknown.transaction_details:${transactionLink}:transactionLink:`,
      transactionNumber: $localize `:@@checkout_sdk.finish_status_unknown.transaction_number:\
        ${'<strong>' + transactionNumber + '</strong>'}:transactionNumber:`,
    };
  }
}
