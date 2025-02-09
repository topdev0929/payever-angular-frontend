import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  flowWithPaymentOptionsFixture,
  paymentFormFixture,
  ratesFixture,
} from '../../../../../../../test/fixtures';
import { RatesDataInterface } from '../../../../../../common';
import { InsuranceDataInterface } from '../interfaces';

import { AbstractInsuranceStrategyClass } from './abstract.class';

class TestAbstractInsuranceStrategyClass extends AbstractInsuranceStrategyClass {
  get insuranceData(): InsuranceDataInterface {
    return undefined;
  }
}

describe('AbstractInsuranceStrategyClass', () => {

  let classInstance: TestAbstractInsuranceStrategyClass;
  let store: Store;

  const mockRatesData: RatesDataInterface = {
    rates: ratesFixture(),
    cpiRates: ratesFixture(),
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
        },
      },
    }));

    classInstance = new TestAbstractInsuranceStrategyClass(TestBed.inject(Injector), mockRatesData);

  });

  it('should create an instance', () => {

    expect(classInstance).toBeDefined();
    expect(classInstance instanceof AbstractInsuranceStrategyClass).toBe(true);

  });

  it('should get credit duration in months from state', () => {

    expect(classInstance.creditDurationInMonths).toEqual(paymentFormFixture().ratesForm.creditDurationInMonths);

  });

  it('should get rate', () => {

    expect(classInstance.rate).toEqual(mockRatesData.rates
      .filter(rate => rate.duration === paymentFormFixture().ratesForm.creditDurationInMonths)[0]);

  });

  it('should get first rate if rate not found', () => {

    const mockRatesDataShortLength: RatesDataInterface = {
      rates: [ratesFixture()[0]],
      cpiRates: [ratesFixture()[0]],
    };
    const classInstanceShortRatesData = new TestAbstractInsuranceStrategyClass(
      TestBed.inject(Injector),
      mockRatesDataShortLength
    );
    jest.spyOn(classInstanceShortRatesData, 'creditDurationInMonths', 'get').mockReturnValue(10000);

    expect(classInstanceShortRatesData.rate).toEqual(mockRatesDataShortLength.rates[0]);

  });

  it('should get cpiRate', () => {

    expect(classInstance.cpiRate).toEqual(mockRatesData.cpiRates
      .filter(rate => rate.duration === paymentFormFixture().ratesForm.creditDurationInMonths)[0]);

  });

  it('should get first cpiRate if cpiRate only one', () => {

    const mockRatesDataShortLength: RatesDataInterface = {
      rates: [ratesFixture()[0]],
      cpiRates: [ratesFixture()[0]],
    };
    const classInstanceShortRatesData = new TestAbstractInsuranceStrategyClass(
      TestBed.inject(Injector),
      mockRatesDataShortLength
    );
    jest.spyOn(classInstanceShortRatesData, 'creditDurationInMonths', 'get').mockReturnValue(10000);

    expect(classInstanceShortRatesData.cpiRate).toEqual(mockRatesDataShortLength.cpiRates[0]);

  });

  it('should transform value to price', () => {

    const currencyPipe = jest.spyOn(classInstance['currencyPipe'], 'transform')
      .mockImplementation(value => `transform__${value}`);

    expect(classInstance['toPrice'](100)).toEqual('transform__100');
    expect(currencyPipe).toHaveBeenCalledWith(100, flowWithPaymentOptionsFixture().currency, 'symbol-narrow');

  });

  it('should transform value to percent', () => {

    const percentPipe = jest.spyOn(classInstance['percentPipe'], 'transform')
      .mockImplementation(value => `transform__${value}%`);

    expect(classInstance['toPercent'](10)).toEqual('transform__10%');
    expect(percentPipe).toHaveBeenCalledWith(10, '1.0-2');

  });

  it('should correct make assets url', () => {

    const fileName = 'test-fine-name';

    expect(classInstance['makeAssetsUrl'](fileName))
      .toEqual(peEnvFixture().custom.cdn + '/docs/santander-de-pos/' + fileName);

  });

  it('should correct create month format', () => {
    const monthString = $localize `:@@payment-santander-de-pos.creditRates.month:`;
    const monthsString = $localize `:@@payment-santander-de-pos.creditRates.months:`;

    expect(classInstance['toMonthFormat'](1)).toEqual(`1 ${monthString}`);
    expect(classInstance['toMonthFormat'](10)).toEqual(`10 ${monthsString}`);

  });

});
