import { Component, ChangeDetectionStrategy, Input, LOCALE_ID } from '@angular/core';
import dayjs from 'dayjs';

import { BaseFinishStatusComponent } from '../base-finish-status.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-finish-status-pending',
  templateUrl: './finish-status-pending.component.html',
  styleUrls: ['./finish-status-pending.component.scss'],
})
export class FinishStatusPendingComponent extends BaseFinishStatusComponent {

  @Input() title: string | true = null;
  @Input() text: string | true = null;

  @Input() total: number = null;
  @Input() currency: string = null;
  @Input() storeName: string = null;
  @Input() createdAt: string = null;
  @Input() billingAddressName: string = null;
  @Input() signingCenterLink: string = null;
  @Input() contractUrl: string = null;
  @Input() flowId: string = null;
  @Input() isPosPayment = false;

  private locale = this.injector.get(LOCALE_ID);

  get createdAtAsString(): string {
    return this.createdAt ? dayjs(this.createdAt).locale(this.locale).format('DD.MM.YYYY HH:mm:ss') : null;
  }

  prepareTranslations(applicationNumber: string, transactionLink: string, transactionNumber: string) {
    this.translations = {
      applicationNumber: $localize `:@@checkout_sdk.finish_status_pending.application_number:${applicationNumber}:applicationNumber:`,
      transactionDetails: $localize `:@@checkout_sdk.finish_status_pending.transaction_details:${transactionLink}:transactionLink:`,
      transactionNumber: $localize `:@@checkout_sdk.finish_status_pending.transaction_number:\
        ${'<strong>' + transactionNumber + '</strong>'}:transactionNumber:`,
    };
  }
}
