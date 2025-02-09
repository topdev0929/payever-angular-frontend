import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { skip, take } from 'rxjs/operators';

import { PatchFormState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';


import { flowWithPaymentOptionsFixture, ratesFixture } from '../../test';

import { IncomeService } from './income.service';
import { RatesCalculationService } from './rates-calculation.service';

describe('IncomeService', () => {
  let service: IncomeService;
  let ratesCalculationService: RatesCalculationService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationService,
        IncomeService,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(IncomeService);
    ratesCalculationService = TestBed.inject(RatesCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  describe('rates$', () => {
    it('should return rates from ratesCalculationService', (done) => {
      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValue(of(ratesFixture()));

      service.rates$.subscribe((result) => {
        expect(result).toEqual(ratesFixture());
        done();
      });

      store.dispatch(new PatchFormState({
        ratesForm: {
          credit_due_date: 1,
          down_payment: 0,
        },
      }));
    });

    it('should handle errors and return an empty array', (done) => {
      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValue(throwError('Mocked error'));

      service.rates$.subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });

      store.dispatch(new PatchFormState({
        ratesForm: {
          credit_due_date: 1,
          down_payment: 0,
        },
      }));
    });
  });

  describe('cpiRates$', () => {
    it('should return CPI rates from ratesCalculationService', (done) => {
      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValue(of(ratesFixture()));

      service.cpiRates$.subscribe((result) => {
        expect(result).toEqual(ratesFixture());
        done();
      });

      store.dispatch(new PatchFormState({
        ratesForm: {
          credit_due_date: 1,
          down_payment: 0,
        },
      }));
    });

    it('should handle errors and return an empty array', (done) => {
      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValue(throwError('Mocked error'));

      service.cpiRates$.subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });

      store.dispatch(new PatchFormState({
        ratesForm: {
          credit_due_date: 1,
          down_payment: 0,
        },
      }));
    });
  });

  describe('cpiTariff$', () => {
    it('should return the CPI tariff from cpiRates$', (done) => {
      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValue(of(ratesFixture()));

      service.cpiTariff$.subscribe((result) => {
        expect(result).toEqual(100);
        done();
      });

      store.dispatch(new PatchFormState({
        ratesForm: {
          credit_due_date: 1,
          down_payment: 0,
        },
      }));
    });

    it('should return null if cpiRates$ is empty', (done) => {
      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValue(of([]));

      service.cpiTariff$.subscribe((result) => {
        expect(result).toBeNull();
        done();
      });

      store.dispatch(new PatchFormState({
        ratesForm: {
          credit_due_date: 1,
          down_payment: 0,
        },
      }));
    });

  });

  describe('ratesData$', () => {
    it('should return an object with rates and cpiRates from combineLatest', (done) => {
      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValueOnce(of(ratesFixture()));
      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValueOnce(of(ratesFixture()));

      service.ratesData$.subscribe((result) => {
        expect(result).toEqual({ rates: ratesFixture(), cpiRates: ratesFixture() });
        done();
      });

      store.dispatch(new PatchFormState({
        ratesForm: {
          credit_due_date: 1,
          down_payment: 0,
        },
      }));
    });
  });
});
