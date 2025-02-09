import { TestBed } from '@angular/core/testing';
import { loadStripe, PaymentRequestShippingOption, Stripe } from '@stripe/stripe-js';
import { of, Subject } from 'rxjs';

import { CommonProvidersTestHelper, flowFixture } from '@pe/checkout/testing';
import { NodeApiCallInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { ComponentConfig, PublishKeyResponseDto } from '../models';
import { widgetConfigFixture } from '../test';

import { PayService } from './pay.service';
import { PaymentRequestAdapter } from './payment-request-adapter.class';
import { PaymentRequestService } from './payment-request.service';
import { StripeWalletService } from './stripe-wallet.service';

jest.mock('@stripe/stripe-js', () => ({
  ...jest.requireActual('@stripe/stripe-js'),
  loadStripe: jest.fn(),
}));

describe('PayService', () => {

  let service: PayService;
  let stripeService: StripeWalletService;
  let paymentRequestService: PaymentRequestService;

  const componentConfig: ComponentConfig = {
    amount: flowFixture().amount,
    deliveryFee: flowFixture().deliveryFee,
    channelSet: flowFixture().channelSetId,
    config: widgetConfigFixture(),
    cart: [],
    isDebugMode: widgetConfigFixture().isDebugMode,
    theme: widgetConfigFixture().theme,
  };
  const paymentMethod = PaymentMethodEnum.GOOGLE_PAY;
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
  const expectedAmount = Math.round(100 * publishKey.initData.totalCharge);

  const mockStripe = {
    paymentRequest: jest.fn().mockReturnValue({
      canMakePayment: jest.fn().mockResolvedValue(true),
    }),
  } as unknown as Stripe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...CommonProvidersTestHelper(),
        PayService,
        StripeWalletService,
        PaymentRequestService,
      ],
    });

    service = TestBed.inject(PayService);
    stripeService = TestBed.inject(StripeWalletService);
    paymentRequestService = TestBed.inject(PaymentRequestService);

    (loadStripe as jest.Mock).mockResolvedValue(mockStripe);
    jest.spyOn(stripeService, 'getPublishKey').mockReturnValue(of(publishKey));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('init', () => {
    it('should successfully init', (done) => {
      service.init(componentConfig, paymentMethod).subscribe(() => {
        expect(stripeService.getPublishKey).toHaveBeenCalledWith(
          paymentMethod,
          componentConfig.channelSet,
          componentConfig.amount,
          componentConfig.config.shippingOption.price,
        );
        expect(loadStripe).toHaveBeenCalledWith(
          publishKey.initData.publishKey,
          { apiVersion: '2023-10-16' },
        );
        expect(mockStripe.paymentRequest).toHaveBeenCalledWith({
          country: publishKey.flow.country,
          currency: publishKey.flow.currency.toLowerCase(),
          total: {
            label: 'Total',
            amount: expectedAmount,
          },
          disableWallets: ['applePay', 'browserCard', 'link'],
          requestPayerEmail: true,
          requestPayerName: true,
          requestPayerPhone: true,
          requestShipping: !!componentConfig.config?.quoteCallbackUrl,
          shippingOptions: [],
        });

        done();
      });

    });

    it('should successfully branch init values', (done) => {
      const componentConfigBranch: ComponentConfig = {
        ...componentConfig,
        config: {
          shippingOption: null,
        },
      };
      const branchPublishKey: PublishKeyResponseDto = {
        ...publishKey,
        flow: {
          country: 'DE',
          currency: undefined,
        },
      };
      jest.spyOn(stripeService, 'getPublishKey').mockReturnValue(of(branchPublishKey));

      service.init(componentConfigBranch, paymentMethod).subscribe(() => {
        expect(stripeService.getPublishKey).toHaveBeenCalledWith(
          paymentMethod,
          componentConfigBranch.channelSet,
          componentConfigBranch.amount,
          0,
        );
        expect(loadStripe).toHaveBeenCalledWith(
          publishKey.initData.publishKey,
          { apiVersion: '2023-10-16' },
        );
        expect(mockStripe.paymentRequest).toHaveBeenCalledWith({
          country: branchPublishKey.flow.country,
          currency: undefined,
          total: {
            label: 'Total',
            amount: expectedAmount,
          },
          disableWallets: ['applePay', 'browserCard', 'link'],
          requestPayerEmail: true,
          requestPayerName: true,
          requestPayerPhone: true,
          requestShipping: false,
          shippingOptions: [],
        });

        done();
      });
    });
  });

  describe('pay', () => {
    const success = new Subject();
    const cancel = new Subject();
    const shippingAddressChange = new Subject();
    const shippingOptionChange = new Subject();

    const paymentRequest = {
      success: () => success.asObservable(),
      cancel: () => cancel.asObservable(),
      shippingAddressChange: () => shippingAddressChange.asObservable(),
      shippingOptionChange: () => shippingOptionChange.asObservable(),
    } as unknown as PaymentRequestAdapter;

    const nodeApiResponse: NodeApiCallInterface = {
      id: 'node-api-id',
      noticeUrl: 'https://payever-notice-url.com',
      cancelUrl: 'https://payever-cancel-url.com',
      failureUrl: 'https://payever-failure-url.com',
      pendingUrl: 'https://payever-pending-url.com',
      successUrl: 'https://payever-success-url.com',
      customerRedirectUrl: 'https://payever-customer-redirect-url.com',
    };

    const flow = flowFixture();

    const clientSecret = 'clientSecret';

    beforeAll(() => {
      Object.defineProperty(window, 'location', {
        value: {
          href: null,
        },
        writable: true,
      });
    });

    beforeEach(() => {
      service.init(componentConfig, paymentMethod).toPromise();

      jest.spyOn(stripeService, 'createFlow').mockReturnValue(of(flow));
      jest.spyOn(stripeService, 'getCallbacks').mockReturnValue(of(nodeApiResponse));
      jest.spyOn(stripeService, 'submitPayment').mockReturnValue(of({
        paymentDetails: { clientSecret },
      }) as any);
      jest.spyOn(paymentRequestService, 'confirmPayment').mockReturnValue(of(true));
    });

    it('should handle success', (done) => {
      const successPayload = {
        paymentMethod: PaymentMethodEnum.GOOGLE_PAY,
        shippingOption: {
          amount: 1000.50,
        },
        shippingAddress: componentConfig.config.shippingAddress,
      };

      service.pay(
        componentConfig,
        paymentMethod,
        paymentRequest,
        mockStripe,
      ).subscribe(() => {
        expect(stripeService.createFlow).toHaveBeenCalledWith(
          componentConfig.channelSet,
          componentConfig.config,
          componentConfig.amount,
        );
        expect(stripeService.getCallbacks).toHaveBeenCalledWith(
          flow.id,
          flow.guestToken,
        );
        expect(stripeService.submitPayment).toHaveBeenCalledWith(
          paymentMethod,
          flow,
          componentConfig.config,
          successPayload.shippingOption.amount / 100,
          successPayload.shippingAddress,
          successPayload.shippingOption,
        );
        expect(paymentRequestService.confirmPayment).toHaveBeenCalledWith(
          successPayload,
          mockStripe,
          clientSecret,
        );
        expect(window.top.location.href).toEqual(nodeApiResponse.successUrl);

        done();
      });

      success.next(successPayload);
    });

    it('should handle cancel', (done) => {
      service.pay(
        componentConfig,
        paymentMethod,
        paymentRequest,
        mockStripe,
      ).subscribe(() => {
        expect(stripeService.createFlow).toHaveBeenCalledWith(
          componentConfig.channelSet,
          componentConfig.config,
          componentConfig.amount,
        );
        expect(stripeService.getCallbacks).toHaveBeenCalledWith(
          flow.id,
          flow.guestToken,
        );
        expect(window.top.location.href).toEqual(nodeApiResponse.cancelUrl);

        done();
      });

      cancel.next();
    });

    it('should handle shippingOptionChange', (done) => {
      const shippingOptionChangePayload = {
        updateWith: jest.fn(),
        shippingOption: {
          amount: 1000.50,
        },
      };

      service.pay(
        componentConfig,
        paymentMethod,
        paymentRequest,
        mockStripe,
      ).subscribe(() => {
        expect(stripeService.createFlow).toHaveBeenCalledWith(
          componentConfig.channelSet,
          componentConfig.config,
          componentConfig.amount,
        );
        expect(stripeService.getCallbacks).toHaveBeenCalledWith(
          flow.id,
          flow.guestToken,
        );
        expect(shippingOptionChangePayload.updateWith).toHaveBeenCalledWith(
          {
            status: 'success',
            total: {
              amount: expectedAmount + shippingOptionChangePayload.shippingOption.amount,
              label: 'Total',
            },
          },
        );

        done();
      });

      shippingOptionChange.next(shippingOptionChangePayload);
    });

    it('should handle shippingAddressChange', (done) => {
      const shippingAddressChangePayload = {
        updateWith: jest.fn(),
        shippingAddress: {
          country: 'DE',
          postalCode: '50000',
        },
      };
      const shippingOptions: PaymentRequestShippingOption[] = [{
        id: 'reference',
        label: 'DHL',
        detail: '',
        amount: 120.33,
      }];
      jest.spyOn(stripeService, 'getShippingOptions').mockReturnValue(of(shippingOptions));

      service.pay(
        componentConfig,
        paymentMethod,
        paymentRequest,
        mockStripe,
      ).subscribe(() => {
        expect(stripeService.createFlow).toHaveBeenCalledWith(
          componentConfig.channelSet,
          componentConfig.config,
          componentConfig.amount,
        );
        expect(stripeService.getCallbacks).toHaveBeenCalledWith(
          flow.id,
          flow.guestToken,
        );
        expect(stripeService.getShippingOptions).toHaveBeenCalledWith(
          componentConfig.config.quoteCallbackUrl,
          {
            country: shippingAddressChangePayload.shippingAddress.country,
            zipCode: shippingAddressChangePayload.shippingAddress.postalCode,
          },
        );
        expect(shippingAddressChangePayload.updateWith).toHaveBeenCalledWith(
          {
            status: 'success',
            total: {
              amount: expectedAmount + shippingOptions[0].amount,
              label: 'Total',
            },
            shippingOptions,
          },
        );

        done();
      });

      shippingAddressChange.next(shippingAddressChangePayload);
    });

    it('should shippingAddressChange handle amount fallback', (done) => {
      const shippingAddressChangePayload = {
        updateWith: jest.fn(),
        shippingAddress: {
          country: 'DE',
          postalCode: '50000',
        },
      };
      const shippingOptions: PaymentRequestShippingOption[] = [{
        id: 'reference',
        label: 'DHL',
        detail: '',
        amount: undefined,
      }];
      jest.spyOn(stripeService, 'getShippingOptions').mockReturnValue(of(shippingOptions));

      service.pay(
        componentConfig,
        paymentMethod,
        paymentRequest,
        mockStripe,
      ).subscribe(() => {
        expect(stripeService.createFlow).toHaveBeenCalledWith(
          componentConfig.channelSet,
          componentConfig.config,
          componentConfig.amount,
        );
        expect(stripeService.getCallbacks).toHaveBeenCalledWith(
          flow.id,
          flow.guestToken,
        );
        expect(stripeService.getShippingOptions).toHaveBeenCalledWith(
          componentConfig.config.quoteCallbackUrl,
          {
            country: shippingAddressChangePayload.shippingAddress.country,
            zipCode: shippingAddressChangePayload.shippingAddress.postalCode,
          },
        );
        expect(shippingAddressChangePayload.updateWith).toHaveBeenCalledWith(
          {
            status: 'success',
            total: {
              amount: expectedAmount,
              label: 'Total',
            },
            shippingOptions,
          },
        );

        done();
      });

      shippingAddressChange.next(shippingAddressChangePayload);
    });

    it('should shippingAddressChange handle invalid_shipping_address', (done) => {
      const shippingAddressChangePayload = {
        updateWith: jest.fn(),
        shippingAddress: {
          country: 'DE',
          postalCode: '50000',
        },
      };
      jest.spyOn(stripeService, 'getShippingOptions').mockReturnValue(of(null));

      service.pay(
        componentConfig,
        paymentMethod,
        paymentRequest,
        mockStripe,
      ).subscribe(() => {
        expect(stripeService.createFlow).toHaveBeenCalledWith(
          componentConfig.channelSet,
          componentConfig.config,
          componentConfig.amount,
        );
        expect(stripeService.getCallbacks).toHaveBeenCalledWith(
          flow.id,
          flow.guestToken,
        );
        expect(stripeService.getShippingOptions).toHaveBeenCalledWith(
          componentConfig.config.quoteCallbackUrl,
          {
            country: shippingAddressChangePayload.shippingAddress.country,
            zipCode: shippingAddressChangePayload.shippingAddress.postalCode,
          },
        );
        expect(shippingAddressChangePayload.updateWith).toHaveBeenCalledWith(
          {
            status: 'invalid_shipping_address',
          },
        );

        done();
      });

      shippingAddressChange.next(shippingAddressChangePayload);
    });

    it('should shippingAddressChange handle undefined quoteCallbackUrl', () => {
      const shippingAddressChangePayload = {
        updateWith: jest.fn(),
        shippingAddress: {
          country: 'DE',
          postalCode: '50000',
        },
      };
      jest.spyOn(stripeService, 'getShippingOptions').mockReturnValue(of(null));

      service.pay(
        {
          ...componentConfig,
          config: null,
        },
        paymentMethod,
        paymentRequest,
        mockStripe,
      ).toPromise();
      expect(stripeService.getShippingOptions).not.toHaveBeenCalled();
      expect(shippingAddressChangePayload.updateWith).not.toHaveBeenCalled();
      shippingAddressChange.next(shippingAddressChangePayload);
    });
  });

});
