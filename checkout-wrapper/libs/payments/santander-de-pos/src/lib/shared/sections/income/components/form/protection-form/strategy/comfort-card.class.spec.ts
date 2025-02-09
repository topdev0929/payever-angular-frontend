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

import { AbstractInsuranceStrategyClass } from './abstract.class';
import { ComfortCardStrategyClass } from './comfort-card.class';

describe('ComfortCardStrategyClass', () => {

  let classInstance: ComfortCardStrategyClass;
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
        ...store.selectSnapshot(PaymentState),
        form: paymentFormFixture(),
      },
    }));

    classInstance = new ComfortCardStrategyClass(TestBed.inject(Injector), mockRatesData);

  });

  it('should create an instance', () => {

    expect(classInstance).toBeDefined();
    expect(classInstance instanceof AbstractInsuranceStrategyClass).toBe(true);

  });

  it('should get insuranceData', () => {

    const INTEREST_RATE = '0.89%';
    jest.spyOn((classInstance as any), 'makeAssetsUrl')
      .mockReturnValue(peEnvFixture().custom.cdn + '/docs/santander-de-pos/' + 'test file');

    expect(classInstance.insuranceData).toMatchObject({
      insuranceOptions: [],
      insuranceValue: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.values.interest_rate:${INTEREST_RATE}:value:`,
      dataForwardingRsv: {
        merchant: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.merchant.comfort_dataForwardingRsv:`,
        selfService: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.self_service.comfort_dataForwardingRsv:`,
      },
      informationPackage: {
        merchant: {
          insuranceConditions: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.comfort_insurance_conditions:`,
          productInformationSheet: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.comfort_product_information_sheet:${peEnvFixture().custom.cdn + '/docs/santander-de-pos/' + 'test file'}:fileUrl:`,
        },
        selfService: {
          insuranceConditions: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.comfort_insurance_conditions:`,
          productInformationSheet: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.comfort_product_information_sheet:${peEnvFixture().custom.cdn + '/docs/santander-de-pos/' + 'test file'}:fileUrl:`,
        },
      },
    });

  });

});
