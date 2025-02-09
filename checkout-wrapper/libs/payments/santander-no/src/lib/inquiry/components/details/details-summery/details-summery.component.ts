import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Store } from '@ngxs/store';

import { PaymentState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-no-details-summery',
  templateUrl: './details-summery.component.html',
  providers: [PeDestroyService],
})
export class DetailsSummaryComponent {
  protected store = this.injector.get(Store);

  public formData = this.store.selectSnapshot(PaymentState.form);

  constructor(protected injector: Injector) {}
}
