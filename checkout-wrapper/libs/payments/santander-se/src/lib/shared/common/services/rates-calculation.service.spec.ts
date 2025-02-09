import { randomInt } from 'crypto';

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { PaymentMethodEnum, RateInterface } from '@pe/checkout/types';

import { RatesCalculationApiService } from './rates-calculation-api.service';
import { clearCache, RatesCalculationService } from './rates-calculation.service';



describe.only('RatesCalculationService', () => {
  let instance: RatesCalculationService;
  const flowId = 'fow-id';
  const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_SE;
  const total = 1000;
  let getRates: jest.SpyInstance;
  let rates: any[];


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RatesCalculationService,
        MockProvider(RatesCalculationApiService),
      ],
      declarations: [],
    });

    instance = TestBed.inject(RatesCalculationService);
    const apiService = TestBed.inject(RatesCalculationApiService);
    rates = [
      { code: randomInt(0, 1000) } as any,
    ];
    getRates = jest.spyOn(apiService, 'getRates').mockReturnValue(of(rates));
  });

  afterEach(() => {
    clearCache();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('isLoading', () => {
    it('should isLoading be true', (done) => {
      instance['loadingSubject$'].next(1);
      instance.isLoading$.subscribe((loading) => {
        expect(loading).toBeTruthy();
        done();
      });
    });

    it('should isLoading be false', (done) => {
      instance['loadingSubject$'].next(0);
      instance.isLoading$.subscribe((loading) => {
        expect(loading).toBeFalsy();
        done();
      });
    });
  });

  describe('fetchRatesOnce', () => {
    it('should fetchRatesOnce successfully return rates', (done) => {

      const fetchRatesSpy = jest.spyOn(instance, 'fetchRates')
        .mockReturnValue(of(rates));

      instance.fetchRatesOnce(flowId, paymentMethod, total, false).subscribe((res) => {
        expect(res).toEqual(rates);
        expect(fetchRatesSpy).toHaveBeenCalledWith(flowId, paymentMethod, total, false);

        done();
      });

    });

    it('should fetchRatesOnce handle if reset is not provided', (done) => {

      const fetchRatesSpy = jest.spyOn(instance, 'fetchRates')
        .mockReturnValue(of(rates));

      instance.fetchRatesOnce(flowId, paymentMethod, total).subscribe((rates) => {
        expect(rates).toEqual(rates);
        expect(fetchRatesSpy).toHaveBeenCalledWith(flowId, paymentMethod, total, false);

        done();
      });

    });

    it('should fetchRatesOnce handle fetchRatesError', (done) => {

      const error = new Error('test');
      jest.spyOn(instance, 'fetchRates')
        .mockReturnValueOnce(of(null));
      const fetchRatesError = jest.spyOn(instance as any, 'fetchRatesError')
        .mockReturnValueOnce(new BehaviorSubject<Error>(error).asObservable());

      instance.fetchRatesOnce(flowId, paymentMethod, total, false).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(fetchRatesError).toHaveBeenCalledWith(flowId, total);
          done();
        },
      });
    });
  });

  describe('instance', () => {
    it('Should fetchRatesOnce', (done) => {
      instance.fetchRatesOnce(flowId, paymentMethod, total).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual(rates);
          expect(getRates).toHaveBeenCalledWith(flowId, paymentMethod, total);
          done();
        }),
      ).subscribe();
    });

    it('Should use cache if available', (done) => {
      instance.fetchRates(flowId, paymentMethod, total).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual(rates);
        }),
        switchMap(() => instance.fetchRates(flowId, paymentMethod, total)),
        tap(() => {
          expect(getRates).toHaveBeenCalledTimes(1);
          done();
        }),
      ).subscribe();
    });

    describe('fetchRates', () => {
      let initRefSpy: jest.SpyInstance;
      let getDataFromCacheSpy: jest.SpyInstance;
      let getRates: jest.SpyInstance;
      let saveDataToCacheSpy: jest.SpyInstance;
      let loadingSubjectNextSpy: jest.SpyInstance;

      const flowId = 'flow-id';
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_UK;
      const flowTotal = 3000;
      const reset = false;

      beforeEach(() => {
        initRefSpy = jest.spyOn((instance as any), 'initRef');
        getDataFromCacheSpy = jest.spyOn((instance as any), 'getDataFromCache');
        getRates = jest.spyOn(instance['ratesCalcApiService'], 'getRates');
        saveDataToCacheSpy = jest.spyOn((instance as any), 'saveDataToCache');
        loadingSubjectNextSpy = jest.spyOn((instance as any).loadingSubject$, 'next');
      });

      it('should fetchRates successfully return rates from cache', (done) => {
        initRefSpy.mockReturnValue({
          subject: new BehaviorSubject<RateInterface[]>(null),
          errorSubject: new BehaviorSubject<Error>(null),
          processed: false,
        });
        getDataFromCacheSpy.mockReturnValue([]);

        instance.fetchRates(flowId, paymentMethod, flowTotal, reset).subscribe((rates) => {
          expect(rates).toEqual([]);
          expect(initRefSpy).toHaveBeenCalledWith(flowId, flowTotal);
          expect(getDataFromCacheSpy).toHaveBeenCalledWith(flowId, flowTotal);
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
        getRates.mockReturnValue(of([]));

        instance.fetchRates(flowId, paymentMethod, flowTotal, reset).subscribe((rates) => {
          expect(rates).toEqual([]);
          expect(initRefSpy).toHaveBeenCalledWith(flowId, flowTotal);
          expect(getDataFromCacheSpy).toHaveBeenCalledWith(flowId, flowTotal);
          expect(getRates).toHaveBeenCalledWith(flowId, paymentMethod, flowTotal);
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
        getDataFromCacheSpy.mockReturnValue([]);

        instance.fetchRates(flowId, paymentMethod, flowTotal).subscribe((rates) => {
          expect(rates).toEqual([]);
          done();
        });
      });

      it('should return null if processed true', (done) => {
        initRefSpy.mockReturnValue({
          subject: new BehaviorSubject<RateInterface[]>(null),
          errorSubject: new BehaviorSubject<Error>(null),
          processed: true,
        });
        getDataFromCacheSpy.mockReturnValue([]);

        instance.fetchRates(flowId, paymentMethod, flowTotal).subscribe((rates) => {
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

        instance.fetchRates(flowId, paymentMethod, flowTotal, reset).toPromise();
        tick();

        expect(errorSubject.value).toEqual(error);
        expect(loadingSubjectNextSpy).toHaveBeenCalledWith(0);
      }));
    });

  });
});
