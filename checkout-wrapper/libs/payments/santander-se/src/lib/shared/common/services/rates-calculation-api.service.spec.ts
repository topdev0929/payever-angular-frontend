import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

import { TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { RatesCalculationApiService } from './rates-calculation-api.service';


describe('RatesCalculationApiService', () => {
  let instance: RatesCalculationApiService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RatesCalculationApiService,
        MockProvider(NodeFlowService),
        MockProvider(TrackingService),
      ],
      declarations: [
      ],
    });
    instance = TestBed.inject(RatesCalculationApiService);
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    it('Should call getRates on NodeFlowService', () => {
      const nodeFlowService = TestBed.inject(NodeFlowService);
      const getRates = jest.spyOn(nodeFlowService, 'getCreditRates').mockReturnValue(of(null));
      instance.getRates('flow-id', PaymentMethodEnum.SANTANDER_INSTALLMENT_SE, 1000);
      expect(getRates).toHaveBeenCalledWith({ amount: '1000' });
    });
  });
});
