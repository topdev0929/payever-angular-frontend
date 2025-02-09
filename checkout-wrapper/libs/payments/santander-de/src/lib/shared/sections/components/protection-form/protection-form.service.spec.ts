import { CurrencyPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow, SetPaymentOptions } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import {
  flowWithPaymentOptionsFixture,
  formOptionsInstallmentFixture,
  ratesFixture,
} from '../../../../test';
import { RatesDataInterface } from '../../../types';

import { SantanderDePosProtectionService } from './protection-form.service';
import { LoanTypesStrategyClass } from './strategy';

jest.mock('./strategy');

describe('SantanderDePosProtectionService', () => {

  let service: SantanderDePosProtectionService;

  let store: Store;

  const ratesData: RatesDataInterface = {
    rates: [ratesFixture()[0]],
    cpiRates: [ratesFixture()[0]],
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderDePosProtectionService,
        {
          provide: CurrencyPipe, useValue: {
            transform: jest.fn().mockReturnValue(null),
          },
        },
      ],
    });

    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPaymentOptions({
      ...flowWithPaymentOptionsFixture().paymentOptions,
      formOptions: formOptionsInstallmentFixture,
    }));

    service = TestBed.inject(SantanderDePosProtectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should initStrategy create LoanTypesStrategyClass instance', () => {
    service.initRatesData(ratesData);

    expect(LoanTypesStrategyClass).toHaveBeenCalledWith(service['injector'], ratesData);
  });

  describe('Getter', () => {
    it('should get insuranceData', () => {
      const { LoanTypesStrategyClass } = jest.requireActual('./strategy');

      service['strategy'] = new LoanTypesStrategyClass(service['injector'], ratesData);

      expect(service.insuranceData).toMatchObject({
        insuranceFootnote: expect.any(String),
        insuranceValue: expect.any(String),
        dataForwardingRsv: {
          merchant: expect.any(String),
          selfService: expect.any(String),
        },
        informationPackage: {
          merchant: {
            insuranceConditions: expect.any(String),
            productInformationSheet: expect.any(String),
          },
          selfService: {
            insuranceConditions: expect.any(String),
            productInformationSheet: expect.any(String),
          },
        },
      });
    });
  });

});
