import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import {
  CheckoutApiService,
} from '@pe/checkout/payment-widgets';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum, WidgetTypeEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ratesFixture } from '../../test/fixtures';
import { RawRatesResponseInterface } from '../models';

import { WidgetsApiService } from './widgets-api.service';

describe('WidgetsApiService', () => {
  let service: WidgetsApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;
  const businessUuid = 'business-uuid';
  const currency = 'EUR';
  const defaultConnectionId = 'default-connection-id';
  const rates = ratesFixture();


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        WidgetsApiService,
        MockProvider(CheckoutApiService, {
          getDefaultConnections: () => of({
            _id: defaultConnectionId,
          }),
          getCheckoutSettings: () => of({
            currency,
            businessUuid,
          }),
        }),
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    env = TestBed.inject(PE_ENV);
    service = TestBed.inject(WidgetsApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify();
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('service', () => {
    it('should BNPL getRates', (done) => {
      const channelSet = 'channel-set-id';
      const payment = PaymentMethodEnum.SANTANDER_FACTORING_DE;
      const amount = 1_000;
      const widgetType = WidgetTypeEnum.Button;
      const result: RawRatesResponseInterface = {
        extra_data: {},
        messages: {},
        credit: rates.rates,
      };
      service.getRates(channelSet, payment, true, amount, widgetType).pipe(
        take(1),
        tap((data) => {
          expect(data).toMatchObject({
            rates: [
              {
                annualFee: 0,
                baseInterestRate: 0,
                billingFee: 0,
                code: '3006',
                effectiveInterest: 1.34,
                maxAmount: 100000,
                minAmount: 1,
                monthlyCost: 8378,
                months: 6,
                payLaterType: true,
                startupFee: 195,
                totalCost: 50465,
              },
            ],
            currency,
          });
          done();
        })
      ).subscribe();

      const url = `${env.backend.webWidgets}/api/app/finance-express/business/${businessUuid}/client-action/calculate-rates`;
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toMatchObject({
        amount: String(amount),
        widgetType,
        paymentOption: payment,
        connectionId: defaultConnectionId,
      });
      req.flush(result);
    });

    it('should getRates', (done) => {
      const channelSet = 'channel-set-id';
      const payment = PaymentMethodEnum.SANTANDER_FACTORING_DE;
      const amount = 1_000;
      const widgetType = WidgetTypeEnum.Button;
      const result: RawRatesResponseInterface = {
        extra_data: {},
        messages: {},
        credit: rates.rates,
      };
      service.getRates(channelSet, payment, false, amount, widgetType).pipe(
        take(1),
        tap((data) => {
          expect(data).toMatchObject({
            rates: [
              {
                annualFee: 0,
                baseInterestRate: 0,
                billingFee: 30,
                code: '5212',
                effectiveInterest: 2.44,
                maxAmount: 100000,
                minAmount: 3000,
                monthlyCost: 4219,
                months: 12,
                payLaterType: false,
                startupFee: 295,
                totalCost: 50925,
              },
            ],
            currency,
          });
          done();
        })
      ).subscribe();

      const url = `${env.backend.webWidgets}/api/app/finance-express/business/${businessUuid}/client-action/calculate-rates`;
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toMatchObject({
        amount: String(amount),
        widgetType,
        paymentOption: payment,
        connectionId: defaultConnectionId,
      });
      req.flush(result);
    });
  });
});
