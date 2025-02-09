import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { RateInterface } from '../../shared';
import { ratesFixture } from '../../test';

import { RatesCalculationApiService } from './rates-calculation-api.service';
import { RatesCalculationService } from './rates-calculation.service';


describe('RatesCalculationService', () => {

  let service: RatesCalculationService;
  let ratesCalcApiService: RatesCalculationApiService;

  const flowId = 'flow-id';
  const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_UK;
  const flowTotal = 3000;
  const deposit = 1000;
  const reset = false;

  const expectedKey = `pe_checkout_wrapper_santander_uk_rates_${flowId}_${flowTotal}_${deposit}`;

  const mockSessionStorage = {
    retrieve: jest.fn(),
    store: jest.fn(),
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationService,
        RatesCalculationApiService,
      ],
    });

    service = TestBed.inject(RatesCalculationService);
    ratesCalcApiService = TestBed.inject(RatesCalculationApiService);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should be defined', () => {

      expect(service).toBeDefined();

    });
  });

  describe('isLoading$', () => {
    it('should be true', (done) => {
      service['loadingSubject$'].next(1);
      service.isLoading$.subscribe((loading) => {
        expect(loading).toBeTruthy();
        done();
      });
    });
    it('should be false', (done) => {
      service['loadingSubject$'].next(0);
      service.isLoading$.subscribe((loading) => {
        expect(loading).toBeFalsy();
        done();
      });
    });
  });

  describe('getDataCacheKey', () => {
    it('should return correct cache key', () => {

      expect(service['getDataCacheKey'](flowId, flowTotal, deposit)).toEqual(expectedKey);

    });

  });

  describe('getDataFromCache', () => {
    it('should get data from cache', () => {

      const sessionRetrieveSpy = jest.spyOn(mockSessionStorage, 'retrieve')
        .mockReturnValue(JSON.stringify(ratesFixture()));

      expect(service['getDataFromCache'](flowId, flowTotal, deposit)).toEqual(ratesFixture());
      expect(sessionRetrieveSpy).toHaveBeenCalledWith(expectedKey);

    });
  });

  describe('saveDataToCache', () => {
    it('should set data to cache', () => {

      const sessionRetrieveSpy = jest.spyOn(mockSessionStorage, 'store');

      service['saveDataToCache'](flowId, flowTotal, deposit, ratesFixture());
      expect(sessionRetrieveSpy).toHaveBeenCalledWith(expectedKey, JSON.stringify(ratesFixture()));

    });
  });

  describe('fetchRatesOnce', () => {
    it('should fetchRatesOnce successfully return rates', (done) => {

      const fetchRatesSpy = jest.spyOn(service, 'fetchRates')
        .mockReturnValue(of(ratesFixture()));

      service.fetchRatesOnce(flowId, paymentMethod, flowTotal, deposit, reset).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(fetchRatesSpy).toHaveBeenCalledWith(flowId, paymentMethod, flowTotal, deposit, reset);

        done();
      });

    });

    it('should fetchRatesOnce handle if reset is not provided', (done) => {

      const fetchRatesSpy = jest.spyOn(service, 'fetchRates')
        .mockReturnValue(of(ratesFixture()));

      service.fetchRatesOnce(flowId, paymentMethod, flowTotal, deposit).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(fetchRatesSpy).toHaveBeenCalledWith(flowId, paymentMethod, flowTotal, deposit, false);

        done();
      });

    });

    it('should fetchRatesOnce handle fetchRatesError', (done) => {

      const error = new Error('test');
      jest.spyOn(service, 'fetchRates')
        .mockReturnValueOnce(of(null));
      const fetchRatesError = jest.spyOn(service as any, 'fetchRatesError')
        .mockReturnValueOnce(new BehaviorSubject<Error>(error).asObservable());

      service.fetchRatesOnce(flowId, paymentMethod, flowTotal, deposit, reset).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(fetchRatesError).toHaveBeenCalledWith(flowId, flowTotal, deposit);
          done();
        },
      });
    });
  });

  describe('fetchRates', () => {
    let initRefSpy: jest.SpyInstance;
    let getDataFromCacheSpy: jest.SpyInstance;
    let getRates: jest.SpyInstance;
    let saveDataToCacheSpy: jest.SpyInstance;
    let loadingSubjectNextSpy: jest.SpyInstance;

    beforeEach(() => {
      initRefSpy = jest.spyOn((service as any), 'initRef');
      getDataFromCacheSpy = jest.spyOn((service as any), 'getDataFromCache');
      getRates = jest.spyOn(ratesCalcApiService, 'getRates');
      saveDataToCacheSpy = jest.spyOn((service as any), 'saveDataToCache');
      loadingSubjectNextSpy = jest.spyOn((service as any).loadingSubject$, 'next');
    });

    it('should fetchRates successfully return rates from cache', (done) => {
      initRefSpy.mockReturnValue({
        subject: new BehaviorSubject<RateInterface[]>(null),
        errorSubject: new BehaviorSubject<Error>(null),
        processed: false,
      });
      getDataFromCacheSpy.mockReturnValue(ratesFixture());

      service.fetchRates(flowId, paymentMethod, flowTotal, deposit, reset).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(initRefSpy).toHaveBeenCalledWith(flowId, flowTotal, deposit);
        expect(getDataFromCacheSpy).toHaveBeenCalledWith(flowId, flowTotal, deposit);
        expect(getRates).not.toHaveBeenCalled();
        expect(loadingSubjectNextSpy).toHaveBeenNthCalledWith(1, 1);
        expect(saveDataToCacheSpy).toHaveBeenCalled();
        expect(loadingSubjectNextSpy).toHaveBeenNthCalledWith(2, 0);

        done();
      });
    });

    it('should fetchRates successfully return api', (done) => {
      initRefSpy.mockReturnValue({
        subject: new BehaviorSubject<RateInterface[]>(null),
        errorSubject: new BehaviorSubject<Error>(null),
        processed: false,
      });
      getDataFromCacheSpy.mockReturnValue(null);
      getRates.mockReturnValue(of(ratesFixture()));

      service.fetchRates(flowId, paymentMethod, flowTotal, deposit, reset).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(initRefSpy).toHaveBeenCalledWith(flowId, flowTotal, deposit);
        expect(getDataFromCacheSpy).toHaveBeenCalledWith(flowId, flowTotal, deposit);
        expect(getRates).toHaveBeenCalledWith(flowId, paymentMethod, flowTotal, deposit);
        expect(loadingSubjectNextSpy).toHaveBeenNthCalledWith(1, 1);
        expect(saveDataToCacheSpy).toHaveBeenCalled();
        expect(loadingSubjectNextSpy).toHaveBeenNthCalledWith(2, 0);

        done();
      });
    });

    it('should fetchRates handle if reset is not provided', (done) => {
      initRefSpy.mockReturnValue({
        subject: new BehaviorSubject<RateInterface[]>(null),
        errorSubject: new BehaviorSubject<Error>(null),
        processed: false,
      });
      getDataFromCacheSpy.mockReturnValue(ratesFixture());

      service.fetchRates(flowId, paymentMethod, flowTotal, deposit).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        done();
      });
    });

    it('should return null if processed true', (done) => {
      initRefSpy.mockReturnValue({
        subject: new BehaviorSubject<RateInterface[]>(null),
        errorSubject: new BehaviorSubject<Error>(null),
        processed: true,
      });
      getDataFromCacheSpy.mockReturnValue(ratesFixture());

      service.fetchRates(flowId, paymentMethod, flowTotal, deposit).subscribe((rates) => {
        expect(rates).toEqual(null);
        done();
      });
    });

    it('should fetchRates handle error', fakeAsync(() => {
      const errorSubject = new BehaviorSubject<any>(null);

      initRefSpy.mockReturnValue({
        subject: new BehaviorSubject<RateInterface[]>(null),
        errorSubject,
        processed: false,
      });
      getDataFromCacheSpy.mockReturnValue(null);
      const error = new Error('test error');
      getRates.mockReturnValue(throwError(error));

      service.fetchRates(flowId, paymentMethod, flowTotal, deposit, reset).toPromise();
      tick();

      expect(errorSubject.value).toEqual(error);
      expect(loadingSubjectNextSpy).toHaveBeenCalledWith(0);
    }));
  });

});
