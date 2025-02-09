import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../../test';

import { GetRatesParamsInterface, RatesCalculationApiService } from './rates-calculation-api.service';

describe('RatesCalculationApiService', () => {
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

  let service: RatesCalculationApiService;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        RatesCalculationApiService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(RatesCalculationApiService);
    nodeFlowService = TestBed.inject(NodeFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRates', () => {
    it('should return rates from NodeFlowService.getCreditRates', (done) => {
      const mockRates = ratesFixture();
      jest.spyOn(nodeFlowService, 'getCreditRates').mockReturnValue(of(mockRates));

      service.getRates(mockParams).subscribe((result) => {
        expect(result).toEqual(mockRates);
        done();
      });
    });

    it('should return null if params are not provided', (done) => {
      service.getRates(null).subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });
});
