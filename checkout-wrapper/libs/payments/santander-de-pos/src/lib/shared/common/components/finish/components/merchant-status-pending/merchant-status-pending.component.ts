import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CustomElementService } from '@pe/checkout/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-pos-finish-merchant-status-pending',
  templateUrl: './merchant-status-pending.component.html',
  styleUrls: ['./merchant-status-pending.component.scss'],
})
export class FinishMerchantStatusPendingComponent {
  constructor(
    protected customElementService: CustomElementService
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'new-progress-64',
    ], null, this.customElementService.shadowRoot);
  }
}
