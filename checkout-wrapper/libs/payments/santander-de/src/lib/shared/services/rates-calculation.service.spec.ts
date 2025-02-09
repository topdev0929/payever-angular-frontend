import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { FlowInterface } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentDataFixture, rateFixture } from '../../test';
import { CommodityGroups, EmploymentChoice, PaymentDataInterface, RateInterface } from '../types';

import { RatesCalculationService } from './rates-calculation.service';

describe('RatesCalculationService', () => {
  const storeHelper = new StoreHelper();

  let service: RatesCalculationService;

  beforeEach(() => {
    const trackingServiceSpy = {
      doEmitApiError: jest.fn().mockName('TrackingService.doEmitApiError'),
    };

    const nodeFlowServiceSpy = {
      initFromFlow: jest.fn().mockName('NodeFlowService.initFromFlow'),
      assignPaymentDetails: jest.fn().mockName('NodeFlowService.assignPaymentDetails'),
      postPayment: jest.fn().mockName('NodeFlowService.postPayment'),
      getCreditRates: () => of(null),
    };

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        HttpClientModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: NodeFlowService, useValue: nodeFlowServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        RatesCalculationService,
      ],
    });
    service = TestBed.inject(RatesCalculationService);
    storeHelper.setMockData();
  });

  describe('Constructor', () => {
    it('Should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getUrlParams', () => {
    const flow = flowWithPaymentOptionsFixture();

    it('should getUrlParams', () => {
      const params : PaymentDataInterface = {
        credit_due_date: 1,
        down_payment: 0,
        freelancer: false,
        amount: flow.total,
        cpi: false,
        dateOfBirth: '',
        employment: EmploymentChoice.EMPLOYEE,
        commodity_group: CommodityGroups.OTHER,
      };

      expect(service['getUrlParams'](flow, params)).toMatchObject({
        amount: flow.total,
        cpi: params.cpi,
        creditDueDate: params.credit_due_date,
        dateOfBirth: params.dateOfBirth,
        employment: params.employment,
        freelancer: params.freelancer,
        downPayment: '0',
        commodityGroup: params.commodity_group,
      });
    });

    it('should getUrlParams with default values', () => {
      const params = {
        employment: EmploymentChoice.EMPLOYEE,
       } as PaymentDataInterface;

      expect(service['getUrlParams'](flow, params)).toMatchObject({
        amount: flow.total,
        cpi: false,
        creditDueDate: '',
        dateOfBirth: '',
        employment: params.employment,
        freelancer: false,
        downPayment: '0',
        commodityGroup: CommodityGroups.NOT_SELECTED,
      });
    });
  });

  describe('#fetchRatesHash() method', () => {
    it('Should produce same hash output for same params (function purity)', () => {
      const flow: FlowInterface = flowWithPaymentOptionsFixture();
      const formData: PaymentDataInterface = paymentDataFixture();

      const hash1: string = service.fetchRatesHash(flow, formData);
      expect(hash1).toBeTruthy();

      const hash2: string = service.fetchRatesHash({ ...flow }, { ...formData });
      expect(hash2).toBeTruthy();

      expect(hash1).toBe(hash2);
    });

    it('Change hash output when incoming params change', () => {
      const formData: PaymentDataInterface = paymentDataFixture();
      const flow1: FlowInterface = flowWithPaymentOptionsFixture();
      const flow2: FlowInterface = {
        ...flow1,
        total: Number(Math.random().toString(10).slice(2)),
      };
      expect(flow1).not.toEqual(flow2);

      const hash1: string = service.fetchRatesHash(flow1, formData);
      const hash2: string = service.fetchRatesHash(flow2, { ...formData });

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('#fetchRates() method', () => {
    let rates: RateInterface[];

    beforeEach(() => {
      rates = [rateFixture()];
    });

    it('Should call API', () => {
      const flow: FlowInterface = flowWithPaymentOptionsFixture();
      const formData: PaymentDataInterface = paymentDataFixture();

      service.fetchRates(flow, formData).subscribe(
        receivedRates => expect(receivedRates).toEqual(rates),
      );
    });
  });


  describe('fetchRatesMinMax', () => {
    it('Should call getRates with the correct arguments', () => {
      const flow = {} as any;
      const formData: PaymentDataInterface = paymentDataFixture();
      const getRatesSpy = jest.spyOn(service as any, 'getRates').mockReturnValue(of([]));

      service.fetchRatesMinMax(flow, formData);

      expect(getRatesSpy).toHaveBeenCalledWith(flow, expect.any(Object), expect.any(String));
    });

    it('Should return the rates min and max values from getRates', (done) => {
      const flow = {} as any;
      const formData: PaymentDataInterface = paymentDataFixture();
      const rates = [
        { id: 1, monthlyPayment: 100, duration: 12 },
        { id: 2, monthlyPayment: 200, duration: 24 },
      ];
      jest.spyOn(service as any, 'getRates').mockReturnValue(of(rates));

      service.fetchRatesMinMax(flow, formData).subscribe((result) => {
        expect(result).toEqual({
          installmentMin: 100,
          installmentMax: 200,
          durationMin: 12,
          durationMax: 24,
        });
        done();
      });
    });
  });
});
