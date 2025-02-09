import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSummaryComponent, FormValue } from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-de-pos-summary-g-address',
  templateUrl: './summary-g-address.component.html',
  providers: [PeDestroyService],
})
export class SummaryGuarantorAddressComponent extends BaseSummaryComponent {
  public paymentMethod: PaymentMethodEnum = this.store.selectSnapshot(FlowState.paymentMethod);
  public formData: FormValue = this.store.selectSnapshot(PaymentState.form);
}
