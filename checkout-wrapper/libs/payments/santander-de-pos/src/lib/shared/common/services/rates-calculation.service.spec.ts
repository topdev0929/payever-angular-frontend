import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../../test';

import { GetRatesParamsInterface, RatesCalculationApiService } from './rates-calculation-api.service';
import { RatesCalculationService } from './rates-calculation.service';

describe('RatesCalculationService', () => {
  const mockParams: GetRatesParamsInterface = {
    dayOfFirstInstalment: 15,
    amount: 15000,
    condition: 'excellent',
    cpi: true,
    dateOfBirth: '1990-05-15',
    profession: 'engineer',
    downPayment: 2000,
    weekOfDelivery: '2023-03-01',
    desiredInstalment: 12,
  };
  const mockCachedRates = ratesFixture();

  let service: RatesCalculationService;
  let ratesCalculationApiService: RatesCalculationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationApiService,
        RatesCalculationService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(RatesCalculationService);
    ratesCalculationApiService = TestBed.inject(RatesCalculationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoading', () => {
    it('should isLoading be true', (done) => {
      service['loadingSubject$'].next(1);
      service.isLoading$.subscribe((loading) => {
        expect(loading).toBeTruthy();
        done();
      });
    });

    it('should isLoading be false', (done) => {
      service['loadingSubject$'].next(0);
      service.isLoading$.subscribe((loading) => {
        expect(loading).toBeFalsy();
        done();
      });
    });
  });

  describe('getDataCacheKey', () => {
    const flowId = 'flow-id';

    it('should get cache key', () => {
      const params: GetRatesParamsInterface = {
        dayOfFirstInstalment: 1000,
        amount: 800,
      };
      expect(service['getDataCacheKey'](flowId, params))
        .toEqual(`pe_checkout_wrapper_santander_de_pos_rates_${flowId}_1000_800`);
    });

    it('should get cache key handle if params null', () => {
      expect(service['getDataCacheKey'](flowId, null))
        .toEqual(`pe_checkout_wrapper_santander_de_pos_rates_${flowId}_`);
    });
  });

  describe('fetchRates', () => {
    it('should return rates from cache if available', (done) => {
      const mockFlowId = 'mockFlowId';
      const getDataFromCacheSpy = jest.spyOn(service as any, 'getDataFromCache').mockReturnValue(mockCachedRates);

      service.fetchRates(mockFlowId, mockParams).subscribe((result) => {
        expect(result).toEqual(mockCachedRates);
        expect(getDataFromCacheSpy).toHaveBeenCalledWith(mockFlowId, mockParams);
        done();
      });
    });

    it('should call RatesCalculationApiService.getRates if data is not available in cache', (done) => {
      const mockFlowId = 'mockFlowId';
      const mockApiRates = ratesFixture();
      const getRatesSpy = jest.spyOn(ratesCalculationApiService, 'getRates').mockReturnValue(of(mockApiRates));

      service.fetchRates(mockFlowId, mockParams).subscribe((result) => {
        expect(result).toEqual(mockApiRates);
        expect(getRatesSpy).toHaveBeenCalledWith(mockParams);
        done();
      });
    });
  });
});
