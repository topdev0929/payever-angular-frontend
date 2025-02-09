import { Injector } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { PaymentState, SetFlow, SetPayments, SetParams } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  flowWithPaymentOptionsFixture,
  paymentFormFixture,
  ratesFixture,
} from '../../../../../../../test';
import { RatesDataInterface } from '../../../../../../common';

import { AbstractInsuranceStrategyClass } from './abstract.class';
import { LoanTypesStrategyClass } from './loan-types.class';

describe('LoanTypesStrategyClass', () => {

  let classInstance: LoanTypesStrategyClass;
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
    store.dispatch(new SetParams({
      merchantMode: false,
    }));

    classInstance = new LoanTypesStrategyClass(TestBed.inject(Injector), mockRatesData);

  });

  it('should create an instance', () => {

    expect(classInstance).toBeDefined();
    expect(classInstance instanceof AbstractInsuranceStrategyClass).toBe(true);

  });

  it('should get desired instalment from state', () => {

    expect(classInstance['desiredInstalment']).toEqual(paymentFormFixture().ratesForm.desiredInstalment);

  });

  it('should get insuranceData', () => {

    const assetsUrl = peEnvFixture().custom.cdn + '/docs/santander-de-pos/' + 'test file';

    jest.spyOn((classInstance as any), 'makeAssetsUrl')
      .mockReturnValue(assetsUrl);
    jest.spyOn((classInstance as any), 'toPrice')
      .mockImplementation(value => `$${value}`);
    jest.spyOn((classInstance as any), 'rate', 'get')
      .mockReturnValue(ratesFixture()[0]);
    jest.spyOn((classInstance as any), 'cpiRate', 'get')
      .mockReturnValue(ratesFixture()[0]);


    const monthlyInstalment = $localize`:@@payment-santander-de-pos.inquiry.sections.protection.options.monthly_installments:$${(ratesFixture()[0].monthlyPayment)}:newValue:$${(ratesFixture()[0].monthlyPayment)}:oldValue:`;
    const totalLoan = $localize`:@@payment-santander-de-pos.inquiry.sections.protection.options.total_loan:$${ratesFixture()[0].totalCreditCost}:newValue:$${(ratesFixture()[0].totalCreditCost)}:oldValue:`;
    const lastInstallment = $localize`:@@payment-santander-de-pos.inquiry.sections.protection.options.last_installment:$${(ratesFixture()[0].lastMonthPayment)}:newValue:$${(ratesFixture()[0].lastMonthPayment)}:oldValue:`;
    const insuranceValue = `$${ratesFixture()[0].specificData.rsvTotal}`;

    expect(classInstance['merchantMode']).toBeFalsy();
    expect(classInstance.insuranceData).toMatchObject({
      insuranceOptions: [
        monthlyInstalment,
        totalLoan,
        lastInstallment,
      ],
      insuranceValue,
      dataForwardingRsv: {
        merchant: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.merchant.dataForwardingRsv:`,
        selfService: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.self_service.dataForwardingRsv:`,
      },
      informationPackage: {
        merchant: {
          insuranceConditions: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.insurance_conditions:`,
          productInformationSheet: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.product_information_sheet:${assetsUrl}:fileUrl:`,
        },
        selfService: {
          insuranceConditions: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.insurance_conditions:`,
          productInformationSheet: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.product_information_sheet:${assetsUrl}:fileUrl:`,
        },
      },
    });

  });

  it('should get insuranceData with else branch', fakeAsync(() => {

    const assetsUrl = peEnvFixture().custom.cdn + '/docs/santander-de-pos/' + 'test file';

    jest.spyOn(classInstance as any, 'merchantMode', 'get')
      .mockReturnValue(true);
    jest.spyOn((classInstance as any), 'makeAssetsUrl')
      .mockReturnValue(assetsUrl);
    jest.spyOn((classInstance as any), 'toPrice')
      .mockImplementation(value => `$${value}`);
    jest.spyOn((classInstance as any), 'rate', 'get')
      .mockReturnValue(ratesFixture()[0]);
    jest.spyOn((classInstance as any), 'cpiRate', 'get')
      .mockReturnValue(ratesFixture()[0]);
    jest.spyOn(classInstance as any, 'desiredInstalment', 'get')
      .mockReturnValue(null);

    expect(classInstance['merchantMode']).toBeTruthy();
    expect(classInstance.insuranceData).toMatchObject({
      insuranceOptions: [],
      insuranceValue: '$0/',
      dataForwardingRsv: {
        merchant: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.merchant.dataForwardingRsv:`,
        selfService: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.self_service.dataForwardingRsv:`,
      },
      informationPackage: {
        merchant: {
          insuranceConditions: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.insurance_conditions:`,
          productInformationSheet: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.product_information_sheet:${assetsUrl}:fileUrl:`,
        },
        selfService: {
          insuranceConditions: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.insurance_conditions:`,
          productInformationSheet: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.product_information_sheet:${assetsUrl}:fileUrl:`,
        },
      },
    });

  }));


});
