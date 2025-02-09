import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

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

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should defined a services on init', () => {

    expect(service['nodeFlowService']).toBeDefined();
    expect(service['trackingService']).toBeDefined();

  });

  it('should getRates successfully return rates', (done) => {

    const flowId = 'flow-id';
    const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_UK;
    const total = 1000;
    const deposit = 500;

    const getCreditRatesSpy = jest.spyOn(nodeFlowService, 'getCreditRates')
      .mockReturnValue(of(ratesFixture()));

    service.getRates(flowId, paymentMethod, total, deposit).subscribe((rates) => {
      expect(rates).toEqual(ratesFixture());
      expect(getCreditRatesSpy).toHaveBeenCalledWith({ amount: String(total), downPayment: deposit });

      done();
    });

  });

  it('should getRates successfully return rates with undefined deposit', (done) => {

    const flowId = 'flow-id';
    const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_UK;
    const total = 1000;

    const getCreditRatesSpy = jest.spyOn(nodeFlowService, 'getCreditRates')
      .mockReturnValue(of(ratesFixture()));

    service.getRates(flowId, paymentMethod, total, null).subscribe((rates) => {
      expect(rates).toEqual(ratesFixture());
      expect(getCreditRatesSpy).toHaveBeenCalledWith({ amount: String(total), downPayment: 0 });

      done();
    });

  });

});
