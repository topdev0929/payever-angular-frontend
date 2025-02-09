import { PercentPipe } from '@angular/common';
import { Injector } from '@angular/core';
import { Store } from '@ngxs/store';

import {
  RateInterface,
  RatesDataInterface,
  FormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { InsuranceDataInterface } from '../interfaces';

export abstract class AbstractInsuranceStrategyClass {
  abstract get insuranceData(): InsuranceDataInterface;

  protected store = this.injector.get(Store);
  private env = this.injector.get(PE_ENV);
  protected flow = this.store.selectSnapshot(FlowState.flow);
  protected paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);

  private percentPipe = this.injector.get(PercentPipe);
  private currencyPipe = this.injector.get(PeCurrencyPipe);

  public readonly paymentForm: FormValue = this.store
    .selectSnapshot(PaymentState.form);

  get creditDurationInMonths(): number {
    return this.paymentForm?.ratesForm?.creditDurationInMonths;
  }

  get rate(): RateInterface {
    return this.ratesData.rates?.length > 1
    ? this.ratesData.rates.find(
      rate => rate.duration === this.creditDurationInMonths
    )
    : this.ratesData.rates[0];
  }

  get cpiRate(): RateInterface {
    return this.ratesData.cpiRates?.length > 1
      ? this.ratesData.cpiRates.find(
        rate => rate.duration === this.creditDurationInMonths
      )
      : this.ratesData.cpiRates[0];
  }

  constructor(
    protected injector: Injector,
    protected ratesData: RatesDataInterface,
  ) {
  }

  protected toPrice(value: number): string {
    return this.currencyPipe.transform(value, this.flow.currency, 'symbol-narrow');
  }

  protected toPercent(value: number): string {
    return this.percentPipe.transform(value, '1.0-2');
  }

  protected toMonthFormat(duration: number): string {
    const month = duration === 1
      ? $localize `:@@payment-santander-de-pos.creditRates.month:`
      : $localize `:@@payment-santander-de-pos.creditRates.months:`;

    return `${duration} ${month}`;
  }

  protected makeAssetsUrl(fileName: string): string {
    return this.env.custom.cdn + '/docs/santander-de-pos/' + fileName;
  }
}
