import { TestBed } from '@angular/core/testing';
import { PaymentRequestShippingAddress, PaymentRequestShippingOption } from '@stripe/stripe-js';
import { of } from 'rxjs';

import { CommonProvidersTestHelper, flowFixture } from '@pe/checkout/testing';
import { NodeApiCallInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { PublishKeyResponseDto, ShippingMethods, ShippingOptionsDTO } from '../models';
import { PaymentResponseWithStatus, widgetConfigFixture } from '../test';

import { StripeWalletApiService } from './stripe-wallet-api.service';
import { StripeWalletService } from './stripe-wallet.service';

describe('StripeWalletService', () => {

  let service: StripeWalletService;
  let api: StripeWalletApiService;

  const flow = flowFixture();

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [], providers: [
        ...CommonProvidersTestHelper(),
        StripeWalletService,
        StripeWalletApiService,
      ],
    });

    service = TestBed.inject(StripeWalletService);
    api = TestBed.inject(StripeWalletApiService);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getPublishKey', () => {
    const paymentMethod = PaymentMethodEnum.GOOGLE_PAY;
    const channelSetId = flow.channelSetId;
    const amount = flow.amount;
    const deliveryFee = flow.deliveryFee;

    const publishKey: PublishKeyResponseDto = {
      flow: {
        country: 'DE',
        currency: 'EUR',
      },
      initData: {
        publishKey: 'publishKey',
        totalCharge: 102.13,
      },
    };

    beforeEach(() => {
      jest.spyOn(api, 'initPayment').mockReturnValue(of(publishKey));
    });

    it('should get publish key', (done) => {
      service.getPublishKey(
        paymentMethod,
        channelSetId,
        amount,
        deliveryFee,
      ).subscribe((key) => {
        expect(key).toEqual(publishKey);
        expect(api.initPayment).toHaveBeenCalledWith(paymentMethod, {
          flow: {
            channelSetId,
          },
          initData: { amount, deliveryFee },
        });
        done();
      });
    });
  });

  describe('createFlow', () => {
    const channelSetId = flow.channelSetId;
    const config = widgetConfigFixture();
    const amount = flow.amount;

    beforeEach(() => {
      jest.spyOn(api, 'createFlow').mockReturnValue(of(flow));
    });

    it('should create flow', (done) => {
      service.createFlow(
        channelSetId,
        config,
        amount,
      ).subscribe((createdFlow) => {
        expect(createdFlow).toEqual(flow);
        expect(api.createFlow).toHaveBeenCalledWith({
          channelSetId,
          amount,
          cancelUrl: config.cancelUrl,
          failureUrl: config.failureUrl,
          successUrl: config.successUrl,
          noticeUrl: config.noticeUrl,
          pendingUrl: config.pendingUrl,
          reference: config.reference,
        });
        done();
      });
    });
  });

  describe('submitPayment', () => {
    const paymentMethod = PaymentMethodEnum.GOOGLE_PAY;
    const config = widgetConfigFixture();
    const deliveryFee = flow.deliveryFee;
    const shippingAddress: PaymentRequestShippingAddress = {
      recipient: 'FirstName LastName',
      city: 'City',
      country: 'DE',
      postalCode: '52321',
      region: 'Berlin',
      addressLine: ['Some st', '12', 'City', 'DE', '52321'],
    };
    const shippingOption: PaymentRequestShippingOption = {
      label: 'Label',
      amount: 1000,
      id: 'carrier-id',
      detail: null,
    };
    const expectedPayload = {
      payment: {
        deliveryFee,
        amount: flow.amount,
        apiCallId: flow.apiCall.id,
        billingAddress: flow.billingAddress,
        businessId: flow.businessId,
        businessName: flow.businessName,
        channel: flow.channel,
        channelSetId: flow.channelSetId,
        currency: flow.currency,
        flowId: flow.id,
        reference: flow.reference,
        total: flow.total,
        shippingOption: {
          name: shippingOption.label,
          price: shippingOption.amount / 100,
          carrier: shippingOption.id,
        },
        shippingAddress: {
          city: shippingAddress.city,
          country: shippingAddress.country,
          zipCode: shippingAddress.postalCode,
          postalCode: shippingAddress.postalCode,
          state: shippingAddress.region,
          firstName: 'FirstName',
          lastName: 'LastName',
          street: 'Some st, 12, City, DE, 52321',
        },
      },
      paymentDetails: {
        frontendCancelUrl: config.cancelUrl,
        frontendFailureUrl: config.failureUrl,
        frontendFinishUrl: config.successUrl,
        quoteCallbackUrl: config.quoteCallbackUrl,
      },
      paymentItems: config.cart,
    };
    const response = PaymentResponseWithStatus(null, null);

    beforeEach(() => {
      jest.spyOn(api, 'submitPayment').mockReturnValue(of(response));
    });

    it('should submit payment with correct payload', (done) => {
      service.submitPayment(
        paymentMethod,
        flow,
        config,
        deliveryFee,
        shippingAddress,
        shippingOption,
      ).subscribe((paymentResponse) => {
        expect(paymentResponse).toEqual(response);
        expect(api.submitPayment).toHaveBeenCalledWith(paymentMethod, expectedPayload, flow.guestToken);
        done();
      });
    });

    it('should submit payment handle empty cart', (done) => {
      service.submitPayment(
        paymentMethod,
        flow,
        { ...config, cart: undefined },
        deliveryFee,
        shippingAddress,
        shippingOption,
      ).subscribe((paymentResponse) => {
        expect(paymentResponse).toEqual(response);
        expect(api.submitPayment).toHaveBeenCalledWith(
          paymentMethod,
          {
            ...expectedPayload,
            paymentItems: [],
          },
          flow.guestToken);
        done();
      });
    });

    it('should submit payment handle empty recipient', (done) => {
      service.submitPayment(
        paymentMethod,
        flow,
        config,
        deliveryFee,
        {
          ...shippingAddress,
          recipient: undefined,
        },
        shippingOption,
      ).subscribe((paymentResponse) => {
        expect(paymentResponse).toEqual(response);
        expect(api.submitPayment).toHaveBeenCalledWith(
          paymentMethod,
          {
            ...expectedPayload,
            payment: {
              ...expectedPayload.payment,
              shippingAddress: {
                ...expectedPayload.payment.shippingAddress,
                firstName: undefined,
                lastName: undefined,
              },
            },
          },
          flow.guestToken);
        done();
      });
    });

    it('should submit payment handle empty shippingAddress', (done) => {
      const payloadWithoutShipping = expectedPayload;
      delete payloadWithoutShipping.payment.shippingAddress;

      service.submitPayment(
        paymentMethod,
        flow,
        config,
        deliveryFee,
        null,
        shippingOption,
      ).subscribe((paymentResponse) => {
        expect(paymentResponse).toEqual(response);
        expect(api.submitPayment).toHaveBeenCalledWith(
          paymentMethod,
          payloadWithoutShipping,
          flow.guestToken);
        done();
      });
    });
  });

  describe('getCallbacks', () => {
    const flowId = flow.id;
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

    beforeEach(() => {
      jest.spyOn(api, 'getCallbacks').mockReturnValue(of(response));
    });

    it('should get callbacks with correct params', (done) => {
      service.getCallbacks(flowId, token).subscribe((apiCall) => {
        expect(apiCall).toEqual(response);
        expect(api.getCallbacks).toHaveBeenCalledWith(flowId, token);
        done();
      });
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

    beforeEach(() => {
      jest.spyOn(api, 'getShippingOptions').mockReturnValue(of(response));

    });

    it('should get shipping options with correct payload', (done) => {
      service.getShippingOptions(url, shippingData).subscribe((options) => {
        expect(options).toEqual([{
          id: response.shippingMethods[0].reference,
          label: response.shippingMethods[0].name,
          detail: '',
          amount: response.shippingMethods[0].price * 100,
        }]);
        expect(api.getShippingOptions).toHaveBeenCalledWith(url, shippingData);

        done();
      });
    });
  });

});
