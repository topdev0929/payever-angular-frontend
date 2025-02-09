import { TestBed } from '@angular/core/testing';
import { PaymentRequest, PaymentRequestPaymentMethodEvent, Stripe } from '@stripe/stripe-js';

import { PaymentRequestService } from './payment-request.service';

describe('PaymentRequestService', () => {
  let service: PaymentRequestService;

  const cancelCallback = jest.fn();
  const paymentMethodCallback = jest.fn();
  const shippingAddressChangeCallback = jest.fn();
  const shippingOptionChangeCallback = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PaymentRequestService,
      ],
    });
    service = TestBed.inject(PaymentRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('listenToPaymentRequest', () => {
    const once = jest.fn((event: string, callback: (ev: any) => void) => {
      if (event === 'paymentmethod') {
        paymentMethodCallback.mockImplementation(callback);
      }
      if (event === 'cancel') {
        cancelCallback.mockImplementation(callback);
      }
    });
    const on = jest.fn((event: string, callback: (ev: any) => void) => {
      if (event === 'shippingaddresschange') {
        shippingAddressChangeCallback.mockImplementation(callback);
      }
      if (event === 'shippingoptionchange') {
        shippingOptionChangeCallback.mockImplementation(callback);
      }
    });
    const paymentRequest = {
      once,
      on,
    } as unknown as PaymentRequest;

    it('should handle paymentmethod', (done) => {
      service.listenToPaymentRequest(paymentRequest).subscribe(() => {
        expect(once).toHaveBeenCalledWith('paymentmethod', expect.any(Function));
        done();
      });
      paymentMethodCallback();
    });
    it('should handle cancel', (done) => {
      service.listenToPaymentRequest(paymentRequest).subscribe(() => {
        expect(paymentRequest.once).toHaveBeenCalledWith('cancel', expect.any(Function));
        done();
      });
      cancelCallback();
    });
    it('should handle shippingaddresschange', (done) => {
      service.listenToPaymentRequest(paymentRequest).subscribe(() => {
        expect(paymentRequest.on).toHaveBeenCalledWith('shippingaddresschange', expect.any(Function));
        done();
      });
      shippingAddressChangeCallback();
    });
    it('should handle shippingoptionchange', (done) => {
      service.listenToPaymentRequest(paymentRequest).subscribe(() => {
        expect(paymentRequest.on).toHaveBeenCalledWith('shippingoptionchange', expect.any(Function));
        done();
      });
      shippingOptionChangeCallback();
    });
  });

  describe('confirmPayment', () => {
    const event = {
      paymentMethod: {
        id: 'paymentMethod-id',
      },
      complete: jest.fn(),
    } as unknown as PaymentRequestPaymentMethodEvent;
    const confirmCardPayment = jest.fn();
    const stripe = {
      confirmCardPayment,
    } as unknown as Stripe;
    const clientSecret = 'clientSecret';

    it('should handle requires_action status', (done) => {
      confirmCardPayment.mockResolvedValue({
        error: null,
        paymentIntent: {
          status: 'requires_action',
        },
      });

      service.confirmPayment(event, stripe, clientSecret).subscribe(() => {
        expect(confirmCardPayment).toHaveBeenNthCalledWith(1, clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false });
        expect(event.complete).toHaveBeenCalledWith('success');
        expect(confirmCardPayment).toHaveBeenNthCalledWith(2, clientSecret);
        done();
      });
    });

    it('should handle error status', (done) => {
      confirmCardPayment.mockResolvedValue({
        error: 'some error',
      });

      service.confirmPayment(event, stripe, clientSecret).subscribe((result) => {
        expect(result).toBeFalsy();
        expect(confirmCardPayment).toHaveBeenCalledTimes(1);
        expect(confirmCardPayment).toHaveBeenCalledWith(clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false });
        expect(event.complete).toHaveBeenCalledWith('fail');
        done();
      });
    });

    it('should return confirmResult', (done) => {
      const expectedResult = {
        paymentIntent: {
          status: 'Some status',
        },
      };
      confirmCardPayment.mockResolvedValue(expectedResult);

      service.confirmPayment(event, stripe, clientSecret).subscribe((result) => {
        expect(result).toEqual(expectedResult);
        expect(confirmCardPayment).toHaveBeenCalledTimes(1);
        expect(confirmCardPayment).toHaveBeenCalledWith(clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false });
        expect(event.complete).toHaveBeenCalledWith('success');
        done();
      });
    });
  });
});
