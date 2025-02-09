import { Directive } from '@angular/core';

import { AbstractRatesContainerComponent } from '@pe/checkout/payment';

import { RatesCalculationService, RateInterface, SelectedRateDataInterface } from '../../../shared';

@Directive()
export abstract class BaseRateComponent extends AbstractRatesContainerComponent {
  protected ratesCalculationService = this.injector.get(RatesCalculationService);

  protected getRateByFormData(initialData: SelectedRateDataInterface, rates: RateInterface[]): RateInterface {
    return rates.find(rate => initialData && String(initialData.campaignCode) === String(rate.code));
  }
}
