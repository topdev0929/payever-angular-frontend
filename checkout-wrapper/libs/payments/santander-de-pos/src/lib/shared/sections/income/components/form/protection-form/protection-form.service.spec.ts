import { CurrencyPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import {
  RatesDataInterface,
} from '@pe/checkout/santander-de-pos/shared';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  flowWithPaymentOptionsFixture,
  paymentOptionsFixture,
  ratesFixture,
  paymentFormFixture,
} from '../../../../../../test';

import { SantanderDePosProtectionService } from './protection-form.service';
import { ComfortCardStrategyClass, LoanTypesStrategyClass } from './strategy';

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
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: {
            ...paymentOptionsFixture(),
            conditions: [
              {
                ...paymentOptionsFixture().conditions[0],
                isComfortCardCondition: null,
              },
              ...paymentOptionsFixture().conditions,
            ],
          },
        },
      },
    }));

    service = TestBed.inject(SantanderDePosProtectionService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should initRatesData update rates data and init strategy', () => {

    const initStrategy = jest.spyOn((service as any), 'initStrategy');

    expect(service['ratesData']).toBeUndefined();

    service.initRatesData(ratesData, paymentFormFixture());

    expect(service['ratesData']).toEqual(ratesData);
    expect(initStrategy).toHaveBeenCalledWith(paymentFormFixture());

  });

  it('should correct map condition', () => {

    const expectedConditions = {
      'condition-key-01': {
        description: 'condition-description-01',
        isComfortCardCondition: true,
      },
      'condition-key-02': {
        description: 'condition-description-02',
        isComfortCardCondition: true,
      },
      'condition-key-03': {
        description: 'Standardfinanzierung',
        isComfortCardCondition: true,
      },
      'condition-key-04': {
        description: 'Standardfinanzierung',
        isComfortCardCondition: true,
      },
    };

    expect(service['mapConditions']()).toEqual(expectedConditions);

  });

  it('should initStrategy create ComfortCardStrategyClass instance', () => {

    service.initRatesData(ratesData, paymentFormFixture());
    service['initStrategy'](paymentFormFixture());

    expect(ComfortCardStrategyClass).toHaveBeenCalledWith(service['injector'], ratesData);
    expect(LoanTypesStrategyClass).not.toHaveBeenCalled();

  });

  it('should initStrategy create LoanTypesStrategyClass instance', () => {

    const doNotMatchCondition: any = {
      ...paymentFormFixture(),
      detailsForm: {
        ...paymentFormFixture(),
        condition: 'condition',
      },
    };

    service.initRatesData(ratesData, doNotMatchCondition);
    service['initStrategy'](doNotMatchCondition);

    expect(ComfortCardStrategyClass).not.toHaveBeenCalled();
    expect(LoanTypesStrategyClass).toHaveBeenCalledWith(service['injector'], ratesData);

  });

  describe('Getter', () => {
    it('should get insuranceData', () => {
      const { LoanTypesStrategyClass } = jest.requireActual('./strategy');

      service['strategy'] = new LoanTypesStrategyClass(service['injector'], ratesData);

      expect(service.insuranceData).toMatchObject({
        insuranceOptions: expect.any(Array),
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

    it('should get cpiRate', () => {
      const { ComfortCardStrategyClass } = jest.requireActual('./strategy');

      service['strategy'] = new ComfortCardStrategyClass(service['injector'], ratesData);

      expect(service.cpiRate).toEqual(ratesData.cpiRates[0]);
    });

    it('should get rate', () => {
      const { ComfortCardStrategyClass } = jest.requireActual('./strategy');

      service['strategy'] = new ComfortCardStrategyClass(service['injector'], ratesData);

      expect(service.rate).toEqual(ratesData.rates[0]);
    });
  });

});
