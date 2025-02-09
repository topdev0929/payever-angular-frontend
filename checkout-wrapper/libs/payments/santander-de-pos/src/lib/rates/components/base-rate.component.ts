import { Directive, Injector } from '@angular/core';

import { AbstractRatesContainerComponent } from '@pe/checkout/payment';
import {
  RatesCalculationService,
  RateInterface,
  SelectedRateDataInterface,
} from '@pe/checkout/santander-de-pos/shared';


@Directive()
export abstract class BaseRateComponent extends AbstractRatesContainerComponent {
  protected ratesCalculationService = this.injector.get(RatesCalculationService);

  constructor(protected injector: Injector) {
    super(injector);
  }

  protected getRateByFormData(initialData: SelectedRateDataInterface, rates: RateInterface[]): RateInterface {
    return rates.find(rate => initialData && String(initialData.creditDurationInMonths) === String(rate.duration));
  }
}
