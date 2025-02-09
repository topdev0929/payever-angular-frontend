import { Component, Input } from '@angular/core';

import { CustomElementService } from '@pe/checkout/utils';

@Component({
  selector: 'santander-no-credit-z-status',
  templateUrl: './credit-z-status.component.html',
  styleUrls: ['./credit-z-status.component.scss'],
})
export class CreditZStatusComponent {

  @Input() title: string;
  @Input() note: string;
  @Input() passed: boolean;
  @Input() faded: boolean;

  constructor(
    protected customElementService: CustomElementService
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['register-32', 'register-done-32'],
      null,
      this.customElementService.shadowRoot
    );
  }
}
