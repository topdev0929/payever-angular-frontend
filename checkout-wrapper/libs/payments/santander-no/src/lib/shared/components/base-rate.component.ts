import { Directive, Injector } from '@angular/core';

import { AbstractRatesContainerComponent } from '@pe/checkout/payment';

import { RatesCalculationService } from '../services';
import { RateInterface, SelectedRateDataInterface } from '../types';

@Directive()
export abstract class BaseRateComponent extends AbstractRatesContainerComponent {
  protected ratesCalculationService: RatesCalculationService = this.injector.get(RatesCalculationService);

  constructor(protected injector: Injector) {
    super(injector);
  }

  makeRateId(rate: RateInterface): string {
    return rate ? rate.campaignCode : null;
  }

  protected getRateByFormData(initialData: SelectedRateDataInterface, rates: RateInterface[]): RateInterface {
    return rates.find(rate => initialData && String(initialData.campaignCode) === String(rate.campaignCode));
  }
}
