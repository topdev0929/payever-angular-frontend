import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { CustomElementService } from '@pe/checkout/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'default-receipt',
  styleUrls: ['./default-receipt.component.scss'],
  templateUrl: 'default-receipt.component.html',
})
export class DefaultReceiptComponent {

  @Input() isStatusSuccess = false;
  @Input() isStatusFail = false;
  @Input() isStatusUnknown = false;
  @Input() orderId: string = null;

  constructor(
    protected customElementService: CustomElementService
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['checkmark-32', 'x-round-white-cross-24', 'error-128'],
      null,
      this.customElementService.shadowRoot
    );
  }
}
