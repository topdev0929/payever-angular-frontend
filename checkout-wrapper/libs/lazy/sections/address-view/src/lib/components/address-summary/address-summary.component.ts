import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { FlowState } from '@pe/checkout/store';
import { AddressInterface, FlowInterface } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-address-summary',
  templateUrl: 'address-summary.component.html',
})
export class AddressSummaryComponent {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  get hideSalutation(): boolean {
    return this.flow.hideSalutation;
  }

  get billingAddress(): AddressInterface {
    return this.flow.billingAddress;
  }

  get shippingAddress(): AddressInterface {
    return (this.flow.shippingAddresses || []).find(address => address.id === this.flow.shippingAddressId);
  }
}
