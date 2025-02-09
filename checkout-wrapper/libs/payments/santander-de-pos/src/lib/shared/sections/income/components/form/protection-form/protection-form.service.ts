import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngxs/store';

import { PaymentState } from '@pe/checkout/store';

import {
  ConditionInterface,
  FormOptionsInterface,
  FormValue,
  RateInterface,
  RatesDataInterface,
} from '../../../../../common';

import { InsuranceDataInterface } from './interfaces';
import {
  AbstractInsuranceStrategyClass,
  ComfortCardStrategyClass,
  LoanTypesStrategyClass,
} from './strategy';

interface MapConditionsInterface {
  [key: string]: {
    description: string;
    isComfortCardCondition: boolean;
  };
}

@Injectable()
export class SantanderDePosProtectionService {
  protected store = this.injector.get(Store);

  private ratesData: RatesDataInterface;
  protected strategy: AbstractInsuranceStrategyClass;

  protected paymentOptions: FormOptionsInterface = this.store.selectSnapshot(PaymentState.options);

  constructor(
    protected injector: Injector,
  ) { }

  initRatesData(ratesData: RatesDataInterface, paymentForm: Partial<FormValue>): void {
    this.ratesData = ratesData;
    this.initStrategy(paymentForm);
  }

  private initStrategy(paymentForm: Partial<FormValue>): void {
    const conditions = this.mapConditions();

    this.strategy = conditions[paymentForm?.detailsForm?.condition]?.isComfortCardCondition
      ? new ComfortCardStrategyClass(this.injector, this.ratesData)
      : new LoanTypesStrategyClass(this.injector, this.ratesData);
  }

  get insuranceData(): InsuranceDataInterface {
    return this.strategy?.insuranceData;
  }

  get cpiRate(): RateInterface {
    return this.strategy?.cpiRate;
  }

  get rate(): RateInterface {
    return this.strategy?.rate;
  }

  private mapConditions(): MapConditionsInterface {
    const conditions = this.paymentOptions.conditions
      .reduce(
        (acc: MapConditionsInterface, item: ConditionInterface) => ({
          ...acc, ...item.programs.reduce(
            (acc, program) => ({
              ...acc,
              [program.key]: {
                description: item.description,
                isComfortCardCondition: item?.isComfortCardCondition ?? false,
              },
            }),
            {}
          ),
        }),
        {}
      );

    return conditions;
  }
}
