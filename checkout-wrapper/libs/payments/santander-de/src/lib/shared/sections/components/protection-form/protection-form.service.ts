import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngxs/store';

import { PaymentState } from '@pe/checkout/store';



import { FormOptionsInterface, RateInterface, RatesDataInterface } from '../../../types';

import { InsuranceDataInterface } from './interfaces';
import {
  AbstractInsuranceStrategyClass,
  LoanTypesStrategyClass,
} from './strategy';

@Injectable()
export class SantanderDePosProtectionService {
  protected store = this.injector.get(Store);

  private ratesData: RatesDataInterface;
  protected strategy: AbstractInsuranceStrategyClass;

  protected paymentOptions: FormOptionsInterface = this.store.selectSnapshot(PaymentState.options);

  constructor(
    protected injector: Injector,
  ) { }

  initRatesData(ratesData: RatesDataInterface): void {
    this.ratesData = ratesData;
    this.initStrategy();
  }

  private initStrategy(): void {
    this.strategy = new LoanTypesStrategyClass(this.injector, this.ratesData);
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
}
