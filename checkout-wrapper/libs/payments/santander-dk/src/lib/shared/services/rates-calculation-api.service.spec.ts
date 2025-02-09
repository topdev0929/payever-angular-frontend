import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';

import { ratesFixture } from '../../test';

import { RatesCalculationApiService } from './rates-calculation-api.service';

describe('RatesCalculationApiService', () => {
  let service: RatesCalculationApiService;

  let nodeFlowService: NodeFlowService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationApiService,
        NodeFlowService,
      ],
    });

    nodeFlowService = TestBed.inject(NodeFlowService);

    service = TestBed.inject(RatesCalculationApiService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get rates', (done) => {

    const total = 1000;
    const productId = '1';

    const nodeFlowServiceSpy = jest.spyOn(nodeFlowService, 'getCreditRates')
      .mockReturnValue(of(ratesFixture()));

    service.getRates(total, productId).subscribe((data) => {
      expect(data).toEqual(ratesFixture());

      expect(nodeFlowServiceSpy).toHaveBeenCalledTimes(1);
      expect(nodeFlowServiceSpy).toHaveBeenCalledWith({ amount: total, productId: productId });

      done();
    });

  });

});
