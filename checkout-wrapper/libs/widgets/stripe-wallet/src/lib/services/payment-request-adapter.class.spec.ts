import type {
  PaymentRequest,
} from '@stripe/stripe-js';

import { PaymentMethodEnum } from '@pe/checkout/types';

import { PaymentRequestAdapter } from './payment-request-adapter.class';

describe('PaymentRequestAdapter', () => {

  let classInstance: PaymentRequestAdapter;

  const cancelCallback = jest.fn();
  const paymentMethodCallback = jest.fn();
  const shippingAddressChangeCallback = jest.fn();
  const shippingOptionChangeCallback = jest.fn();

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
  const canMakePayment = jest.fn();
  const show = jest.fn();
  const paymentRequest = {
    once,
    on,
    canMakePayment,
    show,
  } as unknown as PaymentRequest;

  beforeEach(() => {
    classInstance = new PaymentRequestAdapter(paymentRequest);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(classInstance).toBeTruthy();
    });
  });

  describe('show', () => {
    it('should show fn call paymentRequest show', () => {
      classInstance.show();
      expect(show).toHaveBeenCalled();
    });
  });

  describe('canMakePayment', () => {
    it('should canMakePayment return result', (done) => {
      const expectedResult = {
        [PaymentMethodEnum.GOOGLE_PAY]: true,
        [PaymentMethodEnum.APPLE_PAY]: false,
      };
      canMakePayment.mockResolvedValue(expectedResult);

      classInstance.canMakePayment().subscribe((result) => {
        expect(result).toEqual(expectedResult);
        expect(canMakePayment).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('shippingOptionChange', () => {
    it('should handle correct event type', (done) => {
      classInstance.shippingOptionChange().subscribe(() => {
        expect(paymentRequest.on).toHaveBeenCalledWith('shippingoptionchange', expect.any(Function));
        done();
      });
      shippingOptionChangeCallback();
    });
  });

  describe('shippingAddressChange', () => {
    it('should handle correct event type', (done) => {
      classInstance.shippingAddressChange().subscribe(() => {
        expect(paymentRequest.on).toHaveBeenCalledWith('shippingaddresschange', expect.any(Function));
        done();
      });
      shippingAddressChangeCallback();
    });
  });

  describe('cancel', () => {
    it('should handle correct event type', (done) => {
      classInstance.cancel().subscribe(() => {
          expect(paymentRequest.once).toHaveBeenCalledWith('cancel', expect.any(Function));
          done();
        },
      );
      cancelCallback();
    });
  });

  describe('success', () => {
    it('should handle correct event type', (done) => {
      classInstance.success().subscribe(() => {
        expect(paymentRequest.once).toHaveBeenCalledWith('paymentmethod', expect.any(Function));
        done();
      });
      paymentMethodCallback();
    });
  });
});
