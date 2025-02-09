import { HttpContext, HttpHeaders } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BYPASS_AUTH } from '@pe/checkout/api';
import { CommonProvidersTestHelper, flowFixture, peEnvFixture } from '@pe/checkout/testing';
import { NodeApiCallInterface, PaymentMethodEnum } from '@pe/checkout/types';

import {
  CreateFlowRequestDto,
  PublishKeyRequestDto,
  PublishKeyResponseDto,
  ShippingMethods,
  ShippingOptionsDTO,
} from '../models';
import { paymentPayloadFixture, PaymentResponseWithStatus } from '../test';

import { StripeWalletApiService } from './stripe-wallet-api.service';

describe('StripeWalletApiService', () => {
  let service: StripeWalletApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...CommonProvidersTestHelper(),
        StripeWalletApiService,
      ],
    });

    service = TestBed.inject(StripeWalletApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('initPayment', () => {
    const paymentMethod = PaymentMethodEnum.GOOGLE_PAY;
    const payload: PublishKeyRequestDto = {
      flow: {
        channelSetId: 'channelSetId',
      },
      initData: {
        amount: 100.85,
        deliveryFee: 1.33,
      },
    };
    const response: PublishKeyResponseDto = {
      flow: {
        country: 'DE',
        currency: 'EUR',
      },
      initData: {
        publishKey: 'publishKey',
        totalCharge: 102.13,
      },
    };

    it('should init payment correctly', (done) => {
      const url = `${peEnvFixture().backend.checkout}/api/finance-express/${paymentMethod}/init`;

      service.initPayment(paymentMethod, payload).subscribe((paymentResponse) => {
        expect(paymentResponse).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(response);
    });
  });

  describe('createFlow', () => {
    const payload: CreateFlowRequestDto = {
      channelSetId: 'channelSetId',
      noticeUrl: 'https://payever-notice-url.com',
      cancelUrl: 'https://payever-cancel-url.com',
      failureUrl: 'https://payever-failure-url.com',
      pendingUrl: 'https://payever-pending-url.com',
      successUrl: 'https://payever-success-url.com',
      customerRedirectUrl: 'https://payever-customer-redirect-url.com',
      reference: 'reference',
      amount: 103.85,
    };
    const response = flowFixture();

    it('should create flow perform correctly', (done) => {
      const url = `${peEnvFixture().backend.checkout}/api/flow/v1`;

      service.createFlow(payload).subscribe((flow) => {
        expect(flow).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(payload);
      expect(req.request.context).toEqual(new HttpContext().set(BYPASS_AUTH, true));

      req.flush(response);
    });
  });

  describe('submitPayment', () => {
    const paymentMethod = PaymentMethodEnum.GOOGLE_PAY;
    const body = paymentPayloadFixture();
    const token = 'token';
    const response = PaymentResponseWithStatus(null, null);

    it('should submit payment perform correctly', (done) => {
      const url = `${peEnvFixture().backend.checkout}/api/finance-express/${paymentMethod}/pay`;

      service.submitPayment(paymentMethod, body, token).subscribe((payment) => {
        expect(payment).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(body);
      expect(req.request.context).toEqual(new HttpContext().set(BYPASS_AUTH, true));
      expect(req.request.headers).toEqual(new HttpHeaders().append('authorization', `Bearer ${token}`));

      req.flush(response);
    });
  });

  describe('getCallbacks', () => {
    const flowId = flowFixture().id;
    const token = 'token';
    const response: NodeApiCallInterface = {
      id: 'node-api-id',
      noticeUrl: 'https://payever-notice-url.com',
      cancelUrl: 'https://payever-cancel-url.com',
      failureUrl: 'https://payever-failure-url.com',
      pendingUrl: 'https://payever-pending-url.com',
      successUrl: 'https://payever-success-url.com',
      customerRedirectUrl: 'https://payever-customer-redirect-url.com',
    };

    it('should get callbacks perform correctly', (done) => {
      const url = `${peEnvFixture().backend.checkout}/api/flow/v1/${flowId}/callbacks`;

      service.getCallbacks(flowId, token).subscribe((apiCall) => {
        expect(apiCall).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      expect(req.request.context).toEqual(new HttpContext().set(BYPASS_AUTH, true));
      expect(req.request.headers).toEqual(new HttpHeaders().append('authorization', `Bearer ${token}`));

      req.flush(response);
    });
  });

  describe('getShippingOptions', () => {
    const url = 'https:/payever-get-shipping-options.org';
    const shippingData: ShippingOptionsDTO = {
      country: 'DE',
      zipCode: '52322',
    };
    const response: ShippingMethods = {
      shippingMethods: [{
        price: 12.33,
        name: 'DHL',
        reference: 'reference',
      }],
    };

    it('should get shipping options perform correctly', (done) => {
      service.getShippingOptions(url, shippingData).subscribe((shippingMethods) => {
        expect(shippingMethods).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        shipping: {
          shippingAddress: shippingData,
        },
      });

      req.flush(response);
    });
  });

});
