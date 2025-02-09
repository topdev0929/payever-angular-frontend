import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture, productsFixture, ratesFixture } from '../../test';
import { SharedModule } from '../shared.module';

import { RatesCalculationApiService } from './rates-calculation-api.service';
import { RatesCalculationService } from './rates-calculation.service';

describe('RatesCalculationService', () => {

  let service: RatesCalculationService;

  let store: Store;
  let ratesCalculationApiService: RatesCalculationApiService;

  const productId = String(productsFixture()[0].id);
  const flowId = flowWithPaymentOptionsFixture().id;
  const flowTotal = flowWithPaymentOptionsFixture().total;
  const cacheKey = 'data.cache.key';

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    ratesCalculationApiService = TestBed.inject(RatesCalculationApiService);

    service = TestBed.inject(RatesCalculationService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get data cache key', () => {

    const expectedCacheKey = `checkout_santander_dk_rates_${flowId}_${flowTotal}_${productId}`;

    expect(service['getDataCacheKey'](productId)).toEqual(expectedCacheKey);

  });

  it('should get data from cache', () => {

    const getDataCacheKey = jest.spyOn((service as any), 'getDataCacheKey')
      .mockReturnValue(cacheKey);
    const getItem = jest.spyOn(Storage.prototype, 'getItem')
      .mockReturnValue(JSON.stringify(productId));

    expect(service['getDataFromCache'](productId)).toEqual(productId);
    expect(getDataCacheKey).toHaveBeenCalledWith(productId);
    expect(getItem).toHaveBeenCalledWith(cacheKey);

  });

  it('should save data to cache', () => {

    const getDataCacheKey = jest.spyOn((service as any), 'getDataCacheKey')
      .mockReturnValue(cacheKey);
    const setItem = jest.spyOn(Storage.prototype, 'setItem');

    service['saveDataToCache'](productId, ratesFixture());

    expect(window[`pe_wrapper_santander_dk_${cacheKey}` as any]).toEqual(ratesFixture());
    expect(getDataCacheKey).toHaveBeenCalledWith(productId);
    expect(setItem).toHaveBeenCalledWith(cacheKey, JSON.stringify(ratesFixture()));

  });

  it('should getRates from cache', (done) => {

    const getDataFromCache = jest.spyOn((service as any), 'getDataFromCache')
      .mockReturnValue(ratesFixture());
    const getRates = jest.spyOn(ratesCalculationApiService, 'getRates');
    const saveDataToCache = jest.spyOn((service as any), 'saveDataToCache');

    service.getRates(productId).subscribe((data) => {
      expect(data).toEqual(ratesFixture());
      expect(getDataFromCache).toHaveBeenCalledWith(productId);
      expect(getRates).not.toHaveBeenCalled();
      expect(saveDataToCache).not.toHaveBeenCalled();

      done();
    });

  });

  it('should getRates from ratesCalcApiService if cache is clear', (done) => {

    const getDataFromCache = jest.spyOn((service as any), 'getDataFromCache')
      .mockReturnValue(null);
    const getRates = jest.spyOn(ratesCalculationApiService, 'getRates')
      .mockReturnValue(of(ratesFixture()));
    const saveDataToCache = jest.spyOn((service as any), 'saveDataToCache');

    service.getRates(productId).subscribe((data) => {
      expect(data).toEqual(ratesFixture());
      expect(getDataFromCache).toHaveBeenCalledWith(productId);
      expect(getRates).toHaveBeenCalledWith(flowTotal, productId);
      expect(saveDataToCache).toHaveBeenCalledWith(productId, data);

      done();
    });

  });

});
