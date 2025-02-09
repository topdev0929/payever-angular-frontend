import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test';
import { ProductTypeEnum, RateInterface } from '../types';

import { RatesCalculationApiService } from './rates-calculation-api.service';
import { RatesCalculationService } from './rates-calculation.service';

describe('RatesCalculationService', () => {
  let ratesCalculationService: RatesCalculationService;
  let store: Store;
  let ratesCalculationApiService: RatesCalculationApiService;

  const storeHelper = new StoreHelper();

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

    ratesCalculationService = TestBed.inject(RatesCalculationService);
    ratesCalculationApiService = TestBed.inject(RatesCalculationApiService);
    store = TestBed.inject(Store);
    storeHelper.setMockData();
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  it('should be defined', () => {
    expect(ratesCalculationService).toBeDefined();
  });

  describe('fetchRatesOnce', () => {
    it('should fetch rates once successfully', (done) => {
      const flowId = 'testFlowId';
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO;
      const flowTotal = 100;
      const productType = ProductTypeEnum.HANDLEKONTO;

      const mockRates: RateInterface[] = [];

      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValue(of(mockRates));

      ratesCalculationService.fetchRatesOnce(flowId, paymentMethod, flowTotal, productType).subscribe((rates) => {
        expect(rates).toEqual(mockRates);
        done();
      });

      expect(ratesCalculationService.fetchRates)
        .toHaveBeenCalledWith(flowId, paymentMethod, flowTotal, productType, false);
    });

    it('should reset and fetch rates once successfully', (done) => {
      const flowId = 'testFlowId';
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO;
      const flowTotal = 100;
      const productType = ProductTypeEnum.HANDLEKONTO;

      const mockRates: RateInterface[] = [];

      jest.spyOn(ratesCalculationService, 'fetchRates').mockReturnValue(of(mockRates));

      ratesCalculationService.fetchRatesOnce(flowId, paymentMethod, flowTotal, productType, true).subscribe((rates) => {
        expect(rates).toEqual(mockRates);
        done();
      });


      expect(ratesCalculationService.fetchRates)
        .toHaveBeenCalledWith(flowId, paymentMethod, flowTotal, productType, true);
    });
  });

  describe('fetchRates', () => {
    it('should fetch rates successfully', (done) => {
      const flowId = 'testFlowId';
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO;
      const flowTotal = 100;
      const productType = ProductTypeEnum.HANDLEKONTO;

      const mockRates: RateInterface[] = [];

      jest.spyOn(ratesCalculationApiService, 'getRates').mockReturnValue(of(mockRates));

      ratesCalculationService.fetchRates(flowId, paymentMethod, flowTotal, productType).subscribe((rates) => {
        expect(rates).toEqual(mockRates);
        done();
      });

      expect(ratesCalculationApiService.getRates).toHaveBeenCalledWith(flowId, paymentMethod, flowTotal);
    });

    it('should fetch rates from cache', () => {
      const flowId = 'testFlowId';
      const flowTotal = 100;
      const productType = ProductTypeEnum.HANDLEKONTO;

      const mockCachedRates: RateInterface[] = [];

      jest.spyOn(ratesCalculationService as any, 'getDataFromCache').mockReturnValue(mockCachedRates);

      const rates = ratesCalculationService.fetchRates(
        flowId,
        PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
        flowTotal,
        productType,
      );

      expect(ratesCalculationService['getDataFromCache']).toHaveBeenCalledWith(flowId, flowTotal, productType);
      rates.subscribe((cachedRates) => {
        expect(cachedRates).toEqual(mockCachedRates);
      });
    });

    it('should not fetch rates if already processed and not reset', () => {
      const flowId = 'testFlowId';
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO;
      const flowTotal = 100;
      const productType = ProductTypeEnum.HANDLEKONTO;

      const mockRates: RateInterface[] = [];

      jest.spyOn(ratesCalculationApiService, 'getRates').mockReturnValue(of(mockRates));

      const ref = ratesCalculationService['initRef'](flowId, flowTotal, productType);
      ref.processed = true;

      ratesCalculationService.fetchRates(flowId, paymentMethod, flowTotal, productType).subscribe((rates) => {
        expect(rates).toEqual(mockRates);
      });

      expect(ratesCalculationApiService.getRates).not.toHaveBeenCalled();
    });
  });
});
