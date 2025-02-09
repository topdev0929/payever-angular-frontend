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

import { RawRatesResponseInterface } from '../models';

import { WidgetsApiService } from './widgets-api.service';

describe('WidgetsApiService', () => {
  let service: WidgetsApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;
  const businessUuid = 'business-uuid';
  const currency = 'EUR';
  const defaultConnectionId = 'default-connection-id';


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
    it('should getRates', (done) => {
      const channelSet = 'channel-set-id';
      const payment = PaymentMethodEnum.SANTANDER_FACTORING_DE;
      const amount = 1_000;
      const widgetType = WidgetTypeEnum.Button;
      const productId = 'product-id';
      const result: RawRatesResponseInterface = {
        extra_data: {},
        messages: {},
        credit: [
          {
            parameters: {
              loanAmount: 31000,
              establishmentFee: 0,
              loanDurationInMonths: 12,
              nominalInterest: 14.95,
              effectiveInterest: 16.02,
              monthlyAdministrationFee: 0,
              paymentFreeDuration: 0,
              paymentFreeIntrest: 0,
              paymentFreePayInstallments: false,
              startDate: '2024-04-01T08:24:42.1181099+02:00',
            },
            result: {
              termsInMonth: 12,
              annuallyProcent: 15.78,
              totalCost: 2529,
              totalLoanAmount: 33529,
              monthlyPayment: 2795,
              paymentFreeDuration: 0,
            },
            isDefault: true,
            payLaterType: false,
            interestFreeType: false,
          },
        ],
      };
      service.getRates(channelSet, payment, productId, amount, widgetType).pipe(
        take(1),
        tap((data) => {
          expect(data).toMatchObject({
            rates: result.credit,
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
