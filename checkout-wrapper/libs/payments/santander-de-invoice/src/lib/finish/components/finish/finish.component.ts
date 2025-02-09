import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-invoice-de-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent {

  statusFailTitle = this.isPosPayment()
    ? $localize `:@@santander-de-invoice-pos.inquiry.finish.header.failed:`
    : $localize `:@@santander-de-invoice.inquiry.finish.header.failed:`;
}
