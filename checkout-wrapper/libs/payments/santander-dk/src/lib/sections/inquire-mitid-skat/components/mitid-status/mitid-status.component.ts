import { Component, Input } from '@angular/core';

import { CustomElementService } from '@pe/checkout/utils';

@Component({
  selector: 'santander-dk-mitid-status',
  templateUrl: './mitid-status.component.html',
  styleUrls: ['./mitid-status.component.scss'],
})
export class MitidStatusComponent {

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
