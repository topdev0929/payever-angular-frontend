import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

import { PaymentState } from '@pe/checkout/store';

import { BaseContainerComponent } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-se-rates-view-container',
  templateUrl: './rates-view-container.component.html',
  styleUrls: ['./rates-view-container.component.scss'],
})
export class RatesViewContainerComponent extends BaseContainerComponent {
  public initialData = {
    ratesForm: {},
    ...this.store.selectSnapshot(PaymentState.form),
  };
}
