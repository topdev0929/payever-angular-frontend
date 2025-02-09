import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture, productsFixture } from '../../test';
import { SharedModule } from '../shared.module';

import { ProductsCalculationService } from './products-calculation.service';
import { SantanderDkFlowService } from './santander-dk-flow.service';

describe('ProductsCalculationService', () => {

  let service: ProductsCalculationService;

  let store: Store;
  let santanderDkFlowService: SantanderDkFlowService;

  const flowId = flowWithPaymentOptionsFixture().id;
  const flowConnectionId = flowWithPaymentOptionsFixture().connectionId;
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
    santanderDkFlowService = TestBed.inject(SantanderDkFlowService);

    service = TestBed.inject(ProductsCalculationService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get data cache key', () => {

    const expectedCacheKey = `checkout_santander_dk_products_${flowId}_${flowConnectionId}_${flowTotal}`;

    expect(service['getDataCacheKey'](flowId, flowConnectionId, flowTotal)).toEqual(expectedCacheKey);

  });

  it('should get data from cache', () => {

    const keySpy = jest.spyOn((service as any), 'getDataCacheKey')
      .mockReturnValue(cacheKey);
    const sessionGetSpy = jest.spyOn(Storage.prototype, 'getItem')
      .mockReturnValue(JSON.stringify(productsFixture()));

    expect(service['getDataFromCache'](flowId, flowConnectionId, flowTotal)).toEqual(productsFixture());
    expect(keySpy).toHaveBeenCalledWith(flowId, flowConnectionId, flowTotal);
    expect(sessionGetSpy).toHaveBeenCalledWith(cacheKey);

  });

  it('should save data to cache', () => {


    const keySpy = jest.spyOn((service as any), 'getDataCacheKey')
      .mockReturnValue(cacheKey);
    const sessionSetSpy = jest.spyOn(Storage.prototype, 'setItem');

    service['saveDataToCache'](flowId, flowConnectionId, flowTotal, productsFixture());

    expect(window[`pe_wrapper_santander_dk_${cacheKey}` as any]).toEqual(productsFixture());
    expect(keySpy).toHaveBeenCalledWith(flowId, flowConnectionId, flowTotal);
    expect(sessionSetSpy).toHaveBeenCalledWith(cacheKey, JSON.stringify(productsFixture()));

  });

  it('should getProducts from cache', (done) => {

    const getDataFromCacheSpy = jest.spyOn((service as any), 'getDataFromCache')
      .mockReturnValue(productsFixture());
    const santanderDkFlowServiceSpy = jest.spyOn(santanderDkFlowService, 'getCreditProducts');
    const saveDataToCacheSpy = jest.spyOn((service as any), 'saveDataToCache');

    service.getProducts().subscribe((data) => {
      expect(data).toEqual(productsFixture());
      expect(getDataFromCacheSpy).toHaveBeenCalled();
      expect(santanderDkFlowServiceSpy).not.toHaveBeenCalled();
      expect(saveDataToCacheSpy).not.toHaveBeenCalled();

      done();
    });

  });

  it('should getProducts from santanderDkFlowService if cache is clear', (done) => {

    const getDataFromCacheSpy = jest.spyOn((service as any), 'getDataFromCache')
      .mockReturnValue(null);
    const getCreditProducts = jest.spyOn(santanderDkFlowService, 'getCreditProducts')
      .mockReturnValue(of(productsFixture()));
    const saveDataToCacheSpy = jest.spyOn((service as any), 'saveDataToCache');

    service.getProducts().subscribe((data) => {
      expect(data).toEqual(productsFixture());
      expect(getDataFromCacheSpy).toHaveBeenCalledWith(flowId, flowConnectionId, flowTotal);
      expect(getCreditProducts).toHaveBeenCalledWith({ amount: flowTotal });
      expect(saveDataToCacheSpy).toHaveBeenCalledWith(flowId, flowConnectionId, flowTotal, productsFixture());

      done();
    });

  });

});
