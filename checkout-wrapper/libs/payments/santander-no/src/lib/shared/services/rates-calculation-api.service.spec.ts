import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test';
import { RateInterface } from '../types';

import { RatesCalculationApiService } from './rates-calculation-api.service';

describe('RatesCalculationApiService', () => {
  let ratesCalculationApiService: RatesCalculationApiService;
  let store: Store;
  let nodeFlowService: NodeFlowService;

  const storeHelper = new StoreHelper();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationApiService,
      ],
    });

    ratesCalculationApiService = TestBed.inject(RatesCalculationApiService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    store = TestBed.inject(Store);
    storeHelper.setMockData();
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  it('should be defined', () => {
    expect(ratesCalculationApiService).toBeDefined();
  });

  it('should call getCreditRates with the correct parameters', () => {
    const flowId = 'flowId';
    const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO; 
    const total = 100;

    const getCreditRatesMock = jest.spyOn(nodeFlowService, 'getCreditRates');
    getCreditRatesMock.mockReturnValue(of([]));

    ratesCalculationApiService.getRates(flowId, paymentMethod, total);

    expect(getCreditRatesMock).toHaveBeenCalledWith({ amount: String(total) });
  });

  it('should return an Observable of RateInterface[]', (done) => {
    const flowId = 'flowId';
    const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO; 
    const total = 100;
    const expectedRates: RateInterface[] = [];

    jest.spyOn(nodeFlowService, 'getCreditRates').mockReturnValue(of(expectedRates));

    ratesCalculationApiService.getRates(flowId, paymentMethod, total)
    .subscribe((rates) => {
      expect(rates).toEqual(expectedRates);
      done();
    });
  });
});
