import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { BaseFinishStatusComponent } from '../base-finish-status.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-finish-status-fail',
  templateUrl: './finish-status-fail.component.html',
  styles: [`
  :host > *:last-child {
    margin-bottom: 0;
  }
  `],
})
export class FinishStatusFailComponent extends BaseFinishStatusComponent {

  @Input() title: string | true = null;
  @Input() text: string | true = null;
  @Input() canChangePaymentMethod = false;

  prepareTranslations(applicationNumber: string, transactionLink: string, transactionNumber: string) {
    this.translations = {
      applicationNumber: $localize `:@@checkout_sdk.finish_status_fail.application_number:${applicationNumber}:applicationNumber:`,
      transactionDetails: $localize `:@@checkout_sdk.finish_status_fail.transaction_details:${transactionLink}:transactionLink:`,
      transactionNumber: $localize `:@@checkout_sdk.finish_status_fail.transaction_number:\
      ${'<strong>' + transactionNumber + '</strong>'}:transactionNumber:`,
    };
  }
}
