import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import { PaymentState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { SelectedRateDataInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-dk-rates-view-container',
  templateUrl: './rates-view-container.component.html',
  styles: [':host { display: block; }'],
  providers: [PeDestroyService],
})
export class RatesViewContainerComponent extends AbstractPaymentContainerComponent {
  public readonly initialData$: Observable<SelectedRateDataInterface> = this.store.select(
    PaymentState.form
  ).pipe(
    map(formData => formData?.ratesForm)
  );
}
