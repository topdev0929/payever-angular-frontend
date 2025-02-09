import { Component, ChangeDetectionStrategy, Input, LOCALE_ID } from '@angular/core';
import dayjs from 'dayjs';

import { BaseFinishStatusComponent } from '../base-finish-status.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-finish-status-success',
  templateUrl: './finish-status-success.component.html',
  styleUrls: ['./finish-status-success.component.scss'],
})
export class FinishStatusSuccessComponent extends BaseFinishStatusComponent {

  @Input() title: string | true = null;
  @Input() text: string | true = null;

  @Input() total: number = null;
  @Input() currency: string = null;
  @Input() storeName: string = null;
  @Input() createdAt: string = null;
  @Input() billingAddressName: string = null;
  @Input() orderId: string = null;
  @Input() signingCenterLink: string = null;
  @Input() contractUrl: string = null;
  @Input() isPosPayment = false;
  @Input() merchantText: string = null;

  private locale = this.injector.get(LOCALE_ID);

  get createdAtAsString(): string {
    return this.createdAt
      ? dayjs(this.createdAt).locale(this.locale).format('DD.MM.YYYY HH:mm:ss')
      : null;
  }

  prepareTranslations(applicationNumber: string, transactionLink: string, transactionNumber: string) {
    this.translations = {
      applicationNumber: $localize `:@@checkout_sdk.finish_status_success.application_number:${applicationNumber}:applicationNumber:`,
      transactionDetails: $localize `:@@checkout_sdk.finish_status_success.transaction_details:${transactionLink}:transactionLink:`,
      transactionNumber: $localize `:@@checkout_sdk.finish_status_success.transaction_number:\
        ${'<strong>' + transactionNumber + '</strong>'}:transactionNumber:`,
    };
  }
}
