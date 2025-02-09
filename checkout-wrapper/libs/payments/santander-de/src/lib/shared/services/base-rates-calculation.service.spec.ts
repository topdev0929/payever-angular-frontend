import { Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Params } from '@angular/router';
import { Store } from '@ngxs/store';
import { MD5 } from 'object-hash';
import { of, throwError } from 'rxjs';

import { ApiErrorType, ErrorDetails, TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../test';
import { PaymentDataInterface, RateInterface } from '../types';

import { BaseRatesCalculationService } from './base-rates-calculation.service';

jest.mock('object-hash', () => ({
  MD5: jest.fn(),
}));

const params: Params = {
  amount: 100,
  freelancer: 0,
  creditDueDate: '2024/01/01',
  downPayment: 2000,
  dateOfBirth: '1980/01/01',
  employment: '12',
  cpi: false,
};

@Injectable()
class TestService extends BaseRatesCalculationService<PaymentDataInterface> {
  // eslint-disable-next-line unused-imports/no-unused-vars
  protected getUrlParams(flow: FlowInterface, formData: PaymentDataInterface): Params {
    return params;
  }

  readonly paymentMethod: PaymentMethodEnum;

  constructor(protected injector: Injector) {
    super(injector);
  }
}

describe('BaseRatesCalculationService', () => {

  let service: TestService;
  let trackingService: TrackingService;
  let nodeFlowService: NodeFlowService;
  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        TestService,
        TrackingService,
        NodeFlowService,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    trackingService = TestBed.inject(TrackingService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    service = TestBed.inject(TestService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  describe('Constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('logError', () => {
    it('should logError correct doEmitApiError', (done) => {
      const err = new Error('test error');
      const flowId = 'flow-id';
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT;
      const details: ErrorDetails = {
        url: 'https://payever.org',
        method: 'GET',
      };
      const type = ApiErrorType.ErrorEvent;

      const doEmitApiError = jest.spyOn(trackingService, 'doEmitApiError');
      service['logError'](err, flowId, paymentMethod, details, type).subscribe({
        error: (error) => {
          expect(doEmitApiError).toHaveBeenCalledWith(flowId, paymentMethod, type, details);
          expect(error).toEqual(err);
          done();
        },
      });
    });

    it('should logError handle if type not defined', (done) => {
      const err = new Error('test error');
      const flowId = 'flow-id';
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT;
      const details: ErrorDetails = {
        url: 'https://payever.org',
        method: 'GET',
      };

      const doEmitApiError = jest.spyOn(trackingService, 'doEmitApiError');
      service['logError'](err, flowId, paymentMethod, details).subscribe({
        error: (error) => {
          expect(doEmitApiError).toHaveBeenCalledWith(flowId, paymentMethod, ApiErrorType.ErrorEvent, details);
          expect(error).toEqual(err);
          done();
        },
      });
    });
  });

  describe('getRates', () => {
    const flow = flowWithPaymentOptionsFixture();
    const hash = 'test-hash';

    it('should get rates', (done) => {
      expect(service['cache'][hash]).toBeUndefined();
      const requestCalculatedData = jest.spyOn(service as any, 'requestCalculatedData')
        .mockReturnValue(of(ratesFixture()));
      service['getRates'](flow, params, hash).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(requestCalculatedData).toHaveBeenCalledWith(flow.id, flow.paymentOptions[0], params);
        expect(service['cache'][hash]).not.toBeUndefined();
        done();
      });
    });

    it('should get rates from cache', (done) => {
      service['cache'][hash] = of(ratesFixture());
      expect(service['cache'][hash]).toBeDefined();
      const requestCalculatedData = jest.spyOn(service as any, 'requestCalculatedData');
      service['getRates'](flow, params, hash).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(requestCalculatedData).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('requestCalculatedData', () => {
    const flow = flowWithPaymentOptionsFixture();
    const paymentOption = flowWithPaymentOptionsFixture().paymentOptions[0];

    it('should requestCalculatedData perform correctly', (done) => {
      const getCreditRates = jest.spyOn(nodeFlowService, 'getCreditRates')
        .mockReturnValue(of(ratesFixture()));
      service['requestCalculatedData'](flow.id, paymentOption, params).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(getCreditRates).toHaveBeenCalledWith({
          amount: params.amount,
          freelance: false,
          cpi: false,
          dayOfFirstInstallment: params.creditDueDate,
          downPayment: params.downPayment,
          dateOfBirth: expect.any(Date),
          employment: params.employment,
        });
        done();
      });
    });

    it('should requestCalculatedData handle error', (done) => {
      const error = new Error('test error');
      jest.spyOn(nodeFlowService, 'getCreditRates')
        .mockReturnValue(throwError(error));
      const logError = jest.spyOn(service as any, 'logError');
      service['requestCalculatedData'](flow.id, paymentOption, params).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(logError).toHaveBeenCalledWith(
            err,
            flow.id,
            paymentOption.paymentMethod,
            { url: '/calculate-rates', method: 'POST' },
            ApiErrorType.ErrorRates,
          );
          done();
        },
      });
    });
  });

  describe('getUrlParamsMinMax', () => {
    it('should getUrlParamsMinMax return params', () => {
      const getUrlParams = jest.spyOn(service as any, 'getUrlParams');
      expect(service['getUrlParamsMinMax'](flowWithPaymentOptionsFixture(), {} as any)).toEqual(params);
      expect(getUrlParams).toHaveBeenCalled();
    });
  });

  describe('fetchRates', () => {
    const flow = flowWithPaymentOptionsFixture();
    const formData: PaymentDataInterface = {

    } as any;

    it('should fetchRates return rates', (done) => {
      const getRates = jest.spyOn(service as any, 'getRates')
        .mockReturnValue(of(ratesFixture()));
      const getUrlParams = jest.spyOn(service as any, 'getUrlParams')
        .mockReturnValue(params);
      const fetchRatesHash = jest.spyOn(service as any, 'fetchRatesHash')
        .mockReturnValue(ratesFixture());

      service.fetchRates(flow, formData).subscribe((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(getRates).toHaveBeenCalledWith(flow, params, ratesFixture());
        expect(getUrlParams).toHaveBeenCalledWith(flow, formData);
        expect(fetchRatesHash).toHaveBeenCalledWith(flow, formData);
        done();
      });
    });
  });

  describe('fetchRatesHash and fetchRatesMinMaxHash', () => {
    const flow = flowWithPaymentOptionsFixture();
    const formData = {} as any;

    it('should fetchRatesHash return rates hash', () => {
      const getUrlParams = jest.spyOn(service as any, 'getUrlParams')
        .mockReturnValue(params);
      const MD5Spy = (MD5 as jest.Mock).mockImplementation(value => value);

      expect(service.fetchRatesHash(flow, formData)).toEqual(JSON.stringify(params) + undefined);
      expect(getUrlParams).toHaveBeenCalledWith(flow, formData);
      expect(MD5Spy).toHaveBeenCalledWith(JSON.stringify(params) + undefined);
    });

    it('should fetchRatesMinMaxHash return rates hash', () => {
      const getUrlParams = jest.spyOn(service as any, 'getUrlParams')
        .mockReturnValue(params);
      const MD5Spy = (MD5 as jest.Mock).mockImplementation(value => value);

      expect(service.fetchRatesMinMaxHash(flow, formData)).toEqual(JSON.stringify(params) + undefined);
      expect(getUrlParams).toHaveBeenCalledWith(flow, formData);
      expect(MD5Spy).toHaveBeenCalledWith(JSON.stringify(params) + undefined);
    });
  });

  describe('fetchRatesMinMax', () => {
    const flow = flowWithPaymentOptionsFixture();
    const formData = {} as any;

    it('should fetchRatesMinMax perform correctly', (done) => {
      const rates: RateInterface[] = ratesFixture().slice(0, 2);

      const getRates = jest.spyOn(service as any, 'getRates')
        .mockReturnValue(of(rates));
      const getUrlParamsMinMax = jest.spyOn(service as any, 'getUrlParamsMinMax')
        .mockReturnValue(params);
      const fetchRatesMinMaxHash = jest.spyOn(service as any, 'fetchRatesMinMaxHash')
        .mockReturnValue(ratesFixture());

      const expectedValue = {
        durationMax: rates[1].duration,
        durationMin: rates[0].duration,
        installmentMax: rates[0].monthlyPayment,
        installmentMin: rates[1].monthlyPayment,
      };

      service.fetchRatesMinMax(flow, formData).subscribe((rates) => {
        expect(rates).toEqual(expectedValue);
        expect(getRates).toHaveBeenCalledWith(flow, params, ratesFixture());
        expect(getUrlParamsMinMax).toHaveBeenCalledWith(flow, formData);
        expect(fetchRatesMinMaxHash).toHaveBeenCalledWith(flow, formData);
        done();
      });

    });

    it('should fetchRatesMinMax handle left right branch', (done) => {
      const rates: RateInterface[] = ratesFixture().slice(0, 2);

      const getRates = jest.spyOn(service as any, 'getRates')
        .mockReturnValue(of(rates));
      const getUrlParamsMinMax = jest.spyOn(service as any, 'getUrlParamsMinMax')
        .mockReturnValue(params);
      const fetchRatesMinMaxHash = jest.spyOn(service as any, 'fetchRatesMinMaxHash')
        .mockReturnValue(ratesFixture());

      const expectedValue = {
        durationMax: rates[1].duration,
        durationMin: rates[0].duration,
        installmentMax: rates[0].monthlyPayment,
        installmentMin: rates[1].monthlyPayment,
      };

      service.fetchRatesMinMax(flow, formData).subscribe((rates) => {
        expect(rates).toMatchObject(expectedValue);
        expect(getRates).toHaveBeenCalledWith(flow, params, ratesFixture());
        expect(getUrlParamsMinMax).toHaveBeenCalledWith(flow, formData);
        expect(fetchRatesMinMaxHash).toHaveBeenCalledWith(flow, formData);
        done();
      });
    });

    it('should fetchRatesMinMax handle empty rates', (done) => {
      jest.spyOn(service as any, 'getRates').mockReturnValue(of([]));

      service.fetchRatesMinMax(flow, formData).subscribe((rates) => {
        expect(rates).toEqual({});
        done();
      });
    });
  });
});
