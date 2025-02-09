import { Component, ChangeDetectionStrategy, Input, Inject } from '@angular/core';

import { CustomElementService } from '@pe/checkout/utils';

import { FinishStatusIconConfig, FinishStatusIconConfigInterface } from '../../constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-finish-status-icon',
  templateUrl: './status-icon.component.html',
})
export class StatusIconComponent {

  @Input() status: 'success' | 'pending' | 'fail';

  constructor(
    protected customElementService: CustomElementService,
     @Inject(FinishStatusIconConfig) public iconConfig: FinishStatusIconConfigInterface
  ) {

    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(Object.values(iconConfig.icons),
      null, this.customElementService.shadowRoot);
  }

}
