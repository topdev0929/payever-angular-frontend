import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { map } from 'rxjs/operators';

import { AbstractContainerComponent } from '@pe/checkout/payment';
import { PaymentState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { RatesCalculationService } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-fact-rates-view-container',
  templateUrl: './rates-view-container.component.html',
  styles: [':host { display: block; }'],
  providers: [PeDestroyService],
})
/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
export class RatesViewContainerComponent extends AbstractContainerComponent {

  private ratesCalculationService = this.injector.get(RatesCalculationService);

  public selectedRate$ = this.ratesCalculationService.fetchRates().pipe(
    map((rates) => {
      const duration = this.store.selectSnapshot(PaymentState.form)?.duration;

      return rates.find(rate => rate.duration === duration);
    }),
  );

}
