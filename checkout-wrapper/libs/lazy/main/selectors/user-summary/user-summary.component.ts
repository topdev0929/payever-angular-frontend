import { Component, ChangeDetectionStrategy, Injector } from '@angular/core';

import { AbstractFlowIdComponent } from '@pe/checkout/core';
import { AddressStorageService } from '@pe/checkout/storage';
import { AddressInterface } from '@pe/checkout/types';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-user-summary',
  templateUrl: 'user-summary.component.html',
})
export class UserSummaryComponent extends AbstractFlowIdComponent {
  constructor(
    injector: Injector,
    private addressHelperService: AddressStorageService
  ) {
    super(injector);
  }

  get temporaryAddress(): AddressInterface {
    return this.addressHelperService.getTemporaryAddress(this.flowId);
  }
}
