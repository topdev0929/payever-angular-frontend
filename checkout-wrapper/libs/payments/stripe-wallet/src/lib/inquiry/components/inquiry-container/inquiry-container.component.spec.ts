import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, PatchPaymentResponse, InitSettings } from '@pe/checkout/store';
import { CheckoutSettingsFixture, CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentPreInitializeData } from '@pe/checkout/types';

import { StripeFlowService } from '../../../shared';
import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../../test/fixtures';
import { StripeWalletInquiryModule } from '../../stripe-wallet-inquire.module';

import { InquiryContainerComponent } from './inquiry-container.component';


describe('stripe-inquiry-container', () => {
  let store: Store;
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  let stripeFlowService: StripeFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        StripeFlowService,
        {
          provide: ApiService, useValue: {
            _patchFlow: jest.fn().mockImplementation((_, data) => of(data)),
          },
        },
        importProvidersFrom(StripeWalletInquiryModule),
        PaymentInquiryStorage,
      ],
      declarations: [
        InquiryContainerComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentResponse(PaymentResponseWithStatus(null, null)));
    store.dispatch(new InitSettings(CheckoutSettingsFixture()));
    stripeFlowService = TestBed.inject(StripeFlowService);
    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should ngOnInit', () => {
      const mockValue = '200 $';
      jest.spyOn(component['currencyPipe'], 'transform').mockReturnValue(mockValue);
      component.buttonText.subscribe({
        next: (val: any) => {
          expect(val).toEqual(mockValue);
        },
      });

      component.ngOnInit();
    });

    it('should tryAgain', () => {
      const sendPaymentData = jest.spyOn(component as any, 'sendPaymentData');

      component.tryAgain();

      expect(sendPaymentData).toHaveBeenCalled();
    });

    it('should triggerSubmit', () => {
      const sendPaymentData = jest.spyOn(component as any, 'sendPaymentData');

      component.triggerSubmit();

      expect(sendPaymentData).toHaveBeenCalled();
    });

    it('should sendPaymentData handle empty paymentOption ', () => {

      jest.spyOn(store, 'selectSnapshot').mockReturnValue(null);
      const stripeShowWallet = jest.spyOn(component as any, 'stripeShowWallet');

      try {
        component['sendPaymentData']();
      } catch (error: any) {
        expect(stripeShowWallet).not.toHaveBeenCalled();
        expect(error.message).toEqual('Payment method not presented in list!');
      }

    });

    it('should stop stripeShowWallet if isSendingPayment true', () => {
      component.stripePaymentRequest = {
        show: jest.fn(),
      } as any;
      component.isSendingPayment = true;
      const show = jest.spyOn(component.stripePaymentRequest, 'show');
      component['stripeShowWallet']();
      expect(show).not.toHaveBeenCalled();
    });

    it('should stripeShowWallet', () => {
      component.isSendingPayment = false;
      component.stripePaymentRequest = {
        show: jest.fn,
      } as any;
      const show = jest.spyOn(component.stripePaymentRequest, 'show');
      const next = jest.spyOn(component['stripeFlowService'].confirmCardPayment$, 'next');
      const emit = jest.spyOn(component.continue, 'emit');
      const detectChanges = jest.spyOn(component.cdr, 'detectChanges');

      component['stripeShowWallet']();

      expect(show).toHaveBeenCalled();
      expect(next).toBeCalledWith({
        inProgress: true,
      });
      expect(emit).toBeCalled();
      expect(detectChanges).toBeCalled();
    });

    it('should stripeShowWallet when error', () => {
      component.isSendingPayment = false;
      component.stripePaymentRequest = {} as any;

      const isFinishModalShown = jest.spyOn(component.isFinishModalShown$, 'next');


      component['stripeShowWallet']();

      expect(isFinishModalShown).toBeCalled();
    });

    it('should initStripe', () => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      (window as any).Stripe = jest.fn().mockReturnValue({
        paymentRequest: jest.fn(),
      });
      const addScriptToPage = jest.spyOn(component as any, 'addScriptToPage').mockReturnValue(of(true));
      jest.spyOn(component.cdr, 'detectChanges').mockImplementation(jest.fn());

      const getStripeData = jest.spyOn(component['stripeFlowService'], 'getStripeData')
        .mockReturnValue(of(response));

      component['initStripe']();

      expect(addScriptToPage).toHaveBeenCalled();
      expect(getStripeData).toHaveBeenCalled();
      expect((window as any).Stripe).toHaveBeenCalledWith(response.publishKey, {
        apiVersion: '2020-08-27',
      });

      const emit = jest.spyOn(component.onServiceReady, 'emit');
      getStripeData.mockReturnValue(throwError(new Error('error')));

      component['initStripe']();

      expect(emit).toBeCalledWith(true);
      expect(component.stripeError).toEqual('error');
    });

    it('should initStripe with correct payment request', () => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      const expectedPaymentRequest = {
        country: flowWithPaymentOptionsFixture().billingAddress.country.toUpperCase(),
        currency: flowWithPaymentOptionsFixture().currency.toLowerCase(),
        total: {
          label: 'Total',
          amount: Math.round(100 * response.totalCharge),
        },
        disableWallets: ['applePay', 'browserCard'],
        requestPayerName: false,
        requestPayerEmail: false,
      };
      const paymentRequest = jest.fn();
      (window as any).Stripe = jest.fn().mockReturnValue({
        paymentRequest,
      });
      jest.spyOn(component['stripeFlowService'], 'getStripeData')
        .mockReturnValue(of(response));
      jest.spyOn(component as any, 'addScriptToPage').mockReturnValue(of(true));

      component['initStripe']();

      expect(paymentRequest).toHaveBeenCalledWith(expectedPaymentRequest);
    });

    it('canMakePayment', fakeAsync(() => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };

      const canMakePayment = jest.fn()
        .mockResolvedValue({ applePay: null, googlePay: null });
      const on = jest.fn();
      const paymentRequest = jest.fn().mockReturnValue({
        canMakePayment,
        on,
      });
      (window as any).Stripe = jest.fn().mockReturnValue({
        paymentRequest,
      });
      jest.spyOn(component['stripeFlowService'], 'getStripeData')
        .mockReturnValue(of(response));
      jest.spyOn(component as any, 'addScriptToPage').mockReturnValue(of(true));
      const emit = jest.spyOn(component.onServiceReady, 'emit');

      component['initStripe']();

      expect(canMakePayment).toHaveBeenCalled();
      tick();

      expect(emit).toHaveBeenCalledWith(true);
      expect(on).toHaveBeenNthCalledWith(1, 'cancel', expect.any(Function));
      expect(on).toHaveBeenNthCalledWith(2, 'paymentmethod', expect.any(Function));

      discardPeriodicTasks();
    }));

    it('should canMakePayment perform cancel cb', fakeAsync(() => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };

      const canMakePayment = jest.fn()
        .mockResolvedValue({ applePay: null, googlePay: null });

      const cancelCallback = jest.fn();
      const paymentMethodCallback = jest.fn();

      const paymentRequest = jest.fn().mockReturnValue({
        canMakePayment,
        on: jest.fn((event: string, callback: () => void) => {
          if (event === 'cancel') {
            cancelCallback.mockImplementation(callback);
          } else if (event === 'paymentmethod') {
            paymentMethodCallback.mockImplementation(callback);
          }
        }),
      });

      (window as any).Stripe = jest.fn().mockReturnValue({
        paymentRequest,
      });

      jest.spyOn(component['stripeFlowService'], 'getStripeData')
        .mockReturnValue(of(response));
      jest.spyOn(component as any, 'addScriptToPage').mockReturnValue(of(true));

      const emit = jest.spyOn(component.onServiceReady, 'emit');

      component['initStripe']();

      expect(canMakePayment).toHaveBeenCalled();
      tick();

      expect(emit).toHaveBeenCalledWith(true);

      const confirmCardPaymentNext = jest.spyOn(stripeFlowService.confirmCardPayment$, 'next');
      cancelCallback();
      expect(confirmCardPaymentNext).toHaveBeenCalledWith({ cancel: true });
      expect(component.isShowingWallet).toBe(false);

      discardPeriodicTasks();
    }));

    it('should canMakePayment perform paymentmethod cb', fakeAsync(() => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      const confirmResult: stripe.PaymentIntentResponse = {
        error: null,
        paymentIntent: {
          status: 'requires_action',
          id: '',
          object: 'payment_intent',
          amount: 0,
          amount_capturable: 0,
          amount_received: 0,
          application: '',
          application_fee_amount: 0,
          canceled_at: 0,
          cancelation_reason: 'duplicate',
          capture_method: 'manual',
          charges: undefined,
          client_secret: '',
          confirmation_method: 'manual',
          created: 0,
          currency: '',
          customer: '',
          last_payment_error: undefined,
          livemode: false,
          metadata: undefined,
          next_action: undefined,
          on_behalf_of: '',
          payment_method: '',
          payment_method_types: [],
          receipt_email: '',
          review: '',
          shipping: undefined,
          source: '',
          statement_descriptor: '',
          transfer_data: {
            destination: '',
          },
          transfer_group: '',
        },
      };

      const canMakePayment = jest.fn()
        .mockResolvedValue({ applePay: null, googlePay: null });

      const cancelCallback = jest.fn();
      const paymentMethodCallback = jest.fn();

      const paymentRequest = jest.fn().mockReturnValue({
        canMakePayment,
        on: jest.fn((event: string, callback: (ev: any) => void) => {
          if (event === 'cancel') {
            cancelCallback.mockImplementation(callback);
          } else if (event === 'paymentmethod') {
            paymentMethodCallback.mockImplementation(callback);
          }
        }),
      });
      const confirmCardPayment = jest.fn().mockResolvedValue(confirmResult);
      (window as any).Stripe = jest.fn().mockReturnValue({
        paymentRequest,
        confirmCardPayment,
      });

      jest.spyOn(component['stripeFlowService'], 'getStripeData')
        .mockReturnValue(of(response));
      jest.spyOn(component as any, 'addScriptToPage').mockReturnValue(of(true));
      const confirmCardPaymentNext = jest.spyOn(component['stripeFlowService'].confirmCardPayment$, 'next');

      component['initStripe']();

      expect(canMakePayment).toHaveBeenCalled();
      tick();
      stripeFlowService['postPaymentSubject$'].next(true);

      const completeFn = jest.fn().mockReturnValue(null);
      paymentMethodCallback({ paymentMethod: { id: 'paymentMethodId' }, complete: completeFn });
      expect(component.isShowingWallet).toBe(false);
      tick();
      expect(confirmCardPayment).toHaveBeenCalled();
      expect(completeFn).toHaveBeenCalledWith('success');
      expect(confirmCardPaymentNext).toHaveBeenCalledWith(confirmResult);

      discardPeriodicTasks();
    }));

    it('should canMakePayment perform paymentmethod cb with false status', fakeAsync(() => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      const confirmResult: stripe.PaymentIntentResponse = {
        error: null,
        paymentIntent: {
          status: 'requires_action',
          id: '',
          object: 'payment_intent',
          amount: 0,
          amount_capturable: 0,
          amount_received: 0,
          application: '',
          application_fee_amount: 0,
          canceled_at: 0,
          cancelation_reason: 'duplicate',
          capture_method: 'manual',
          charges: undefined,
          client_secret: '',
          confirmation_method: 'manual',
          created: 0,
          currency: '',
          customer: '',
          last_payment_error: undefined,
          livemode: false,
          metadata: undefined,
          next_action: undefined,
          on_behalf_of: '',
          payment_method: '',
          payment_method_types: [],
          receipt_email: '',
          review: '',
          shipping: undefined,
          source: '',
          statement_descriptor: '',
          transfer_data: {
            destination: '',
          },
          transfer_group: '',
        },
      };

      const canMakePayment = jest.fn()
        .mockResolvedValue({ applePay: null, googlePay: null });

      const cancelCallback = jest.fn();
      const paymentMethodCallback = jest.fn();

      const paymentRequest = jest.fn().mockReturnValue({
        canMakePayment,
        on: jest.fn((event: string, callback: (ev: any) => void) => {
          if (event === 'cancel') {
            cancelCallback.mockImplementation(callback);
          } else if (event === 'paymentmethod') {
            paymentMethodCallback.mockImplementation(callback);
          }
        }),
      });
      const confirmCardPayment = jest.fn().mockResolvedValue(confirmResult);
      (window as any).Stripe = jest.fn().mockReturnValue({
        paymentRequest,
        confirmCardPayment,
      });

      jest.spyOn(component['stripeFlowService'], 'getStripeData')
        .mockReturnValue(of(response));
      jest.spyOn(component as any, 'addScriptToPage').mockReturnValue(of(true));
      const confirmCardPaymentNext = jest.spyOn(component['stripeFlowService'].confirmCardPayment$, 'next');

      component['initStripe']();

      expect(canMakePayment).toHaveBeenCalled();
      tick();
      stripeFlowService['postPaymentSubject$'].next(false);

      const completeFn = jest.fn().mockReturnValue(null);
      paymentMethodCallback({ paymentMethod: { id: 'paymentMethodId' }, complete: completeFn });
      expect(component.isShowingWallet).toBe(false);
      tick();
      expect(confirmCardPayment).not.toHaveBeenCalled();
      expect(completeFn).not.toHaveBeenCalledWith('success');
      expect(confirmCardPaymentNext).not.toHaveBeenCalledWith(confirmResult);

      discardPeriodicTasks();
    }));

    it('should canMakePayment perform paymentmethod cb with error', fakeAsync(() => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      const confirmResult: stripe.PaymentIntentResponse = {
        error: {
          type: 'test',
        },
      } as any;

      const canMakePayment = jest.fn()
        .mockResolvedValue({ applePay: null, googlePay: null });

      const cancelCallback = jest.fn();
      const paymentMethodCallback = jest.fn();

      const paymentRequest = jest.fn().mockReturnValue({
        canMakePayment,
        on: jest.fn((event: string, callback: (ev: any) => void) => {
          if (event === 'cancel') {
            cancelCallback.mockImplementation(callback);
          } else if (event === 'paymentmethod') {
            paymentMethodCallback.mockImplementation(callback);
          }
        }),
      });
      const confirmCardPayment = jest.fn().mockResolvedValue(confirmResult);
      (window as any).Stripe = jest.fn().mockReturnValue({
        paymentRequest,
        confirmCardPayment,
      });

      jest.spyOn(component['stripeFlowService'], 'getStripeData')
        .mockReturnValue(of(response));
      jest.spyOn(component as any, 'addScriptToPage').mockReturnValue(of(true));
      const confirmCardPaymentNext = jest.spyOn(component['stripeFlowService'].confirmCardPayment$, 'next');

      component['initStripe']();

      expect(canMakePayment).toHaveBeenCalled();
      tick();
      stripeFlowService['postPaymentSubject$'].next(true);

      const completeFn = jest.fn().mockReturnValue(null);
      paymentMethodCallback({ paymentMethod: { id: 'paymentMethodId' }, complete: completeFn });
      expect(component.isShowingWallet).toBe(false);
      tick();
      expect(confirmCardPayment).toHaveBeenCalled();
      expect(completeFn).toHaveBeenCalledWith('fail');
      expect(confirmCardPaymentNext).toHaveBeenCalledWith(confirmResult);

      discardPeriodicTasks();
    }));


  });
});

