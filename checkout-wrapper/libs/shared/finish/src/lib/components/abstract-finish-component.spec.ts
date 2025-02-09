import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';

import { TopLocationService } from '@pe/checkout/location';
import { ApiCallUrlService } from '@pe/checkout/node-api';
import { PluginEventsService } from '@pe/checkout/plugins';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';
import { PaymentHelperService, SALUTATION_TRANSLATION } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../test';

import { AbstractFinishComponent } from './abstract-finish-component';

@Component({
  selector: 'extends-abstract-finish-component',
  template: `
    <button class='cleanUp' (click)='cleanUp.emit()'></button>
    <button class='close' (click)='close.emit()'></button>
    <button class='closeButtonClicked' (click)='closeButtonClicked.emit()'></button>
    <button class='changePaymentMethod' (click)='changePaymentMethod.emit()'></button>
    <button class='tryAgain' (click)='tryAgain.emit()'></button>
  `,
})
class TestAbstractFinishComponent extends AbstractFinishComponent {}

describe('AbstractFinishComponent', () => {
  let component: TestAbstractFinishComponent;
  let fixture: ComponentFixture<TestAbstractFinishComponent>;

  let store: Store;
  let _pluginEventsService: PluginEventsService;

  const paymentResponse = PaymentResponseWithStatus(
    PaymentStatusEnum.STATUS_IN_PROCESS,
    PaymentSpecificStatusEnum.NEED_MORE_INFO
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper(), PluginEventsService],
      declarations: [TestAbstractFinishComponent],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    _pluginEventsService = TestBed.inject(PluginEventsService);
    fixture = TestBed.createComponent(TestAbstractFinishComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('input / output', () => {
    it('should handle input', () => {
      fixture.componentRef.setInput('isLoading', true);
      expect(component.isLoading).toBeTruthy();
      fixture.componentRef.setInput('isChangingPaymentMethod', 'true');
      expect(component.isChangingPaymentMethod).toBeTruthy();
      fixture.componentRef.setInput('embeddedMode', 'true');
      expect(component.embeddedMode).toBeTruthy();
      fixture.componentRef.setInput('merchantMode', 'true');
      expect(component.merchantMode).toBeTruthy();
      fixture.componentRef.setInput('showCloseButton', 'true');
      expect(component.showCloseButton).toBeTruthy();
      fixture.componentRef.setInput('showCloseButton', null);
      expect(component.showCloseButton).toEqual(!!flowWithPaymentOptionsFixture().apiCall.cancelUrl);
      fixture.componentRef.setInput('showChangePaymentButton', 'true');
      expect(component.showChangePaymentButton).toBeTruthy();
      fixture.componentRef.setInput('isDisableChangePayment', 'true');
      expect(component.isDisableChangePayment).toBeTruthy();
      fixture.componentRef.setInput('darkMode', 'true');
      expect(component.darkMode).toBeTruthy();
      fixture.componentRef.setInput('payment', paymentResponse);
      expect(component.payment).toEqual(paymentResponse);
      fixture.componentRef.setInput('nodeResult', paymentResponse);
      expect(component.nodeResult).toEqual(paymentResponse);
      fixture.componentRef.setInput('asSinglePayment', false);
      expect(component.asSinglePayment).toBeFalsy();
      expect(component.isDisableChangePayment).toBeFalsy();
      fixture.componentRef.setInput('errorMessage', 'some-error');
      expect(component.errorMessage).toEqual('some-error');
    });

    it('should handle output', () => {
      jest.spyOn(component.cleanUp, 'emit');
      jest.spyOn(component.close, 'emit');
      jest.spyOn(component.closeButtonClicked, 'emit');
      jest.spyOn(component.changePaymentMethod, 'emit');
      jest.spyOn(component.tryAgain, 'emit');

      fixture.debugElement.query(By.css('.cleanUp')).nativeElement.click();
      expect(component.cleanUp.emit).toHaveBeenCalled();

      fixture.debugElement.query(By.css('.close')).nativeElement.click();
      expect(component.close.emit).toHaveBeenCalled();

      fixture.debugElement.query(By.css('.closeButtonClicked')).nativeElement.click();
      expect(component.closeButtonClicked.emit).toHaveBeenCalled();

      fixture.debugElement.query(By.css('.changePaymentMethod')).nativeElement.click();
      expect(component.changePaymentMethod.emit).toHaveBeenCalled();

      fixture.debugElement.query(By.css('.tryAgain')).nativeElement.click();
      expect(component.tryAgain.emit).toHaveBeenCalled();
    });
  });

  describe('getter / setter', () => {
    describe('applicationNumber', () => {
      it('should get from nodeResult applicationNo', () => {
        fixture.componentRef.setInput('nodeResult', { paymentDetails: { applicationNo: 'applicationNo' } });
        expect(component.applicationNumber).toEqual('applicationNo');
      });
      it('should get from nodeResult applicationNumber', () => {
        fixture.componentRef.setInput('nodeResult', { paymentDetails: { applicationNumber: 'applicationNumber' } });
        expect(component.applicationNumber).toEqual('applicationNumber');
      });
      it('should get from payment application_no', () => {
        fixture.componentRef.setInput('nodeResult', null);
        fixture.componentRef.setInput('payment', { payment_details: { application_no: 'application_no' } });
        expect(component.applicationNumber).toEqual('application_no');
      });
      it('should get from payment application_no', () => {
        fixture.componentRef.setInput('nodeResult', null);
        fixture.componentRef.setInput('payment', { payment_details: { application_number: 'application_number' } });
        expect(component.applicationNumber).toEqual('application_number');
      });
      it('should get null', () => {
        fixture.componentRef.setInput('nodeResult', null);
        fixture.componentRef.setInput('payment', null);
        expect(component.applicationNumber).toBeNull();
      });
    });

    describe('transactionNumber', () => {
      it('should get from nodeResult transactionNumber', () => {
        fixture.componentRef.setInput('nodeResult', { paymentDetails: { transactionNumber: 'transactionNumber' } });
        expect(component.transactionNumber).toEqual('transactionNumber');
      });
      it('should get from payment transaction_number', () => {
        fixture.componentRef.setInput('nodeResult', null);
        fixture.componentRef.setInput('payment', { payment_details: { transaction_number: 'transaction_number' } });
        expect(component.transactionNumber).toEqual('transaction_number');
      });
      it('should get null', () => {
        fixture.componentRef.setInput('nodeResult', null);
        fixture.componentRef.setInput('payment', null);
        expect(component.transactionNumber).toBeNull();
      });
    });

    describe('signingCenterLink', () => {
      it('should get link', () => {
        const id = 'payment-id';
        const expectedLink = `${peEnvFixture().backend.checkout}/santander-de/download-contract/${id}`;
        fixture.componentRef.setInput('payment', { id });
        expect(component.signingCenterLink).toEqual(expectedLink);
      });

      it('should handle null id', () => {
        fixture.componentRef.setInput('payment', null);
        expect(component.signingCenterLink).toEqual('');
      });
    });

    describe('apiCallUrlService getters', () => {
      it('should get failureUrl', () => {
        jest.spyOn(ApiCallUrlService.prototype, 'getFailureUrl').mockReturnValue('failureUrl');
        expect(component.failureUrl).toEqual('failureUrl');
      });
      it('should get customerRedirectUrl', () => {
        jest.spyOn(ApiCallUrlService.prototype, 'getCustomerRedirectUrl').mockReturnValue('customerRedirectUrl');
        expect(component.customerRedirectUrl).toEqual('customerRedirectUrl');
      });
      it('should get successUrl', () => {
        jest.spyOn(ApiCallUrlService.prototype, 'getSuccessUrl').mockReturnValue('successUrl');
        expect(component.successUrl).toEqual('successUrl');
      });
      it('should get pendingUrl', () => {
        jest.spyOn(ApiCallUrlService.prototype, 'getPendingUrl').mockReturnValue('pendingUrl');
        expect(component.pendingUrl).toEqual('pendingUrl');
      });
      it('should get customerRedirectPendingUrl', () => {
        jest
          .spyOn(ApiCallUrlService.prototype, 'getCustomerRedirectPendingUrl')
          .mockReturnValue('customerRedirectPendingUrl');
        expect(component.customerRedirectPendingUrl).toEqual('customerRedirectPendingUrl');
      });
    });

    describe('specificStatus getter', () => {
      it('should get specificStatus from nodeResult specificStatus', () => {
        component.nodeResult = {
          ...component.nodeResult,
          payment: {
            ...component.nodeResult?.payment,
            specificStatus: PaymentSpecificStatusEnum.NEED_MORE_INFO,
          },
        };

        expect(component.specificStatus).toEqual(PaymentSpecificStatusEnum.NEED_MORE_INFO);
      });

      it('should get specificStatus from payment specific_status', () => {
        component.payment = {
          ...component.payment,
          specific_status: PaymentSpecificStatusEnum.STATUS_PENDING,
        };

        expect(component.specificStatus).toEqual(PaymentSpecificStatusEnum.STATUS_PENDING);
      });

      it('should get null', () => {
        component.payment = null;
        component.nodeResult = null;
        expect(component.specificStatus).toBeNull();
      });
    });

    describe('status getter', () => {
      it('should get status from nodeResult status', () => {
        component.nodeResult = {
          ...component.nodeResult,
          payment: {
            ...component.nodeResult?.payment,
            status: PaymentStatusEnum.STATUS_ACCEPTED,
          },
        };

        expect(component.status).toEqual(PaymentStatusEnum.STATUS_ACCEPTED);
      });

      it('should get status from payment status', () => {
        component.payment = {
          ...component.payment,
          status: PaymentStatusEnum.STATUS_IN_PROCESS,
        };

        expect(component.status).toEqual(PaymentStatusEnum.STATUS_IN_PROCESS);
      });

      it('should get null', () => {
        component.payment = null;
        component.nodeResult = null;
        expect(component.status).toBeNull();
      });
    });

    describe('createdAt getter', () => {
      const date = new Date().toString();
      const expectedCreatedAt = dayjs(date).format('DD.MM.YYYY HH:mm:ss');

      it('should get createdAt from nodeResult createdAt', () => {
        component.nodeResult = {
          ...component.nodeResult,
          createdAt: date,
        };

        expect(component.createdAt).toEqual(expectedCreatedAt);
      });

      it('should get createdAt from payment created_at', () => {
        component.payment = {
          ...component.payment,
          created_at: date,
        };

        expect(component.createdAt).toEqual(expectedCreatedAt);
      });

      it('should get null', () => {
        component.payment = null;
        component.nodeResult = null;
        expect(component.createdAt).toBeNull();
      });
    });

    describe('order id getter', () => {
      it('should get orderId from flow reference', () => {
        expect(component.orderId).toEqual(flowWithPaymentOptionsFixture().reference.toUpperCase());
      });
    });

    describe('transactionLink getter', () => {
      it('should get transactionLink', () => {
        component.payment = {
          ...component.payment,
          customer_transaction_link: 'customer_transaction_link',
        };
        expect(component.transactionLink).toEqual('customer_transaction_link');
      });

      it('should get null', () => {
        component.payment = null;
        expect(component.transactionLink).toBeNull();
      });
    });

    describe('paymentStatusAsText', () => {
      it('should get payment text', () => {
        component.payment = {
          ...component.payment,
          specific_status: PaymentSpecificStatusEnum.STATUS_PENDING,
        };

        expect(component.paymentStatusAsText).toEqual(expect.any(String));
      });

      it('should handle unexpected ss in mapper', () => {
        component.payment = {
          ...component.payment,
          specific_status: PaymentSpecificStatusEnum.STATUS_ZURUECKGESTELLT,
        };

        expect(component.paymentStatusAsText).toEqual(PaymentSpecificStatusEnum.STATUS_ZURUECKGESTELLT);
      });
    });

    describe('enableHiddenCalls getter', () => {
      it('should get true from payment ', () => {
        component.payment = {
          ...component.payment,
          shop_redirect_enabled: true,
        };

        expect(component.enableHiddenCalls).toBeTruthy();
      });

      it('should get true from nodeResult options', () => {
        component.payment = null;
        component.nodeResult = {
          ...component.nodeResult,
          options: {
            ...component.nodeResult?.options,
            shopRedirectEnabled: true,
          },
        };

        expect(component.enableHiddenCalls).toBeTruthy();
      });

      it('should get false', () => {
        component.payment = null;
        component.nodeResult = null;

        expect(component.enableHiddenCalls).toBeFalsy();
      });
    });

    describe('isCanShowTransactionLink', () => {
      it('should get true', () => {
        component.payment = {
          ...component.payment,
          customer_transaction_link: 'some-link',
        };
        expect(component.isCanShowTransactionLink()).toBeTruthy();
      });
    });

    describe('isPaymentAlreadySubmitted', () => {
      it('should get true', () => {
        component.errorMessage = 'already submitted';
        expect(component.isPaymentAlreadySubmitted()).toBeTruthy();
      });
    });

    describe('getIframeCallbackUrl', () => {
      it('should return null', () => {
        component.payment = {
          ...component.payment,
          shop_redirect_enabled: true,
        };
        expect(component.getIframeCallbackUrl()).toBeNull();
      });

      it('should return redirect url', () => {
        jest.spyOn(ApiCallUrlService.prototype, 'getCustomerRedirectUrl').mockReturnValue('customerRedirectUrl');
        expect(component.getIframeCallbackUrl()).toEqual('customerRedirectUrl');
      });
    });

    describe('isPos getter', () => {
      it('should get isPOS', () => {
        jest.spyOn(PaymentHelperService.prototype, 'isPos');

        expect(component.flow.channel).toEqual('pos');
        expect(component.isPosPayment()).toBeTruthy();
      });
    });

    describe('getApiCallUrl', () => {
      let getPaymentStatus: jest.SpyInstance;

      beforeEach(() => {
        getPaymentStatus = jest.spyOn(component, 'getPaymentStatus');
      });

      it('should get successUrl if payment not null', () => {
        component.payment = {};
        getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);
        jest.spyOn(ApiCallUrlService.prototype, 'getSuccessUrl').mockReturnValue('successUrl');
        expect(component.getApiCallUrl()).toEqual('successUrl');
      });

      it('should get successUrl if nodeResult not null', () => {
        component.nodeResult = PaymentResponseWithStatus(null, null);
        getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);
        jest.spyOn(ApiCallUrlService.prototype, 'getSuccessUrl').mockReturnValue('successUrl');
        expect(component.getApiCallUrl()).toEqual('successUrl');
      });

      it('should get pendingUrl if payment not null', () => {
        component.payment = {};
        jest.spyOn(component, 'isStatusPending').mockReturnValue(true);
        jest.spyOn(ApiCallUrlService.prototype, 'getPendingUrl').mockReturnValue('pendingUrl');
        expect(component.getApiCallUrl()).toEqual('pendingUrl');
      });

      it('should get pendingUrl if nodeResult not null', () => {
        component.nodeResult = PaymentResponseWithStatus(null, null);
        jest.spyOn(component, 'isStatusPending').mockReturnValue(true);
        jest.spyOn(ApiCallUrlService.prototype, 'getPendingUrl').mockReturnValue('pendingUrl');
        expect(component.getApiCallUrl()).toEqual('pendingUrl');
      });

      it('should get failureUrl if payment not null', () => {
        component.payment = {};
        getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_FAILED);
        jest.spyOn(ApiCallUrlService.prototype, 'getFailureUrl').mockReturnValue('failureUrl');
        expect(component.getApiCallUrl()).toEqual('failureUrl');
      });

      it('should get failureUrl if nodeResult not null', () => {
        component.nodeResult = PaymentResponseWithStatus(null, null);
        getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_FAILED);
        jest.spyOn(ApiCallUrlService.prototype, 'getFailureUrl').mockReturnValue('failureUrl');
        expect(component.getApiCallUrl()).toEqual('failureUrl');
      });

      it('should get null if payment and nodeResult null', () => {
        expect(component.getApiCallUrl()).toBeNull();
      });

      it('should get null if statuses not match', () => {
        getPaymentStatus.mockReturnValue(null);
        expect(component.getApiCallUrl()).toBeNull();
      });
    });

    describe('status getter', () => {
      let getPaymentStatus: jest.SpyInstance;

      beforeEach(() => {
        getPaymentStatus = jest.spyOn(component, 'getPaymentStatus');
      });

      describe('isStatusFail', () => {
        it('should get true if STATUS_FAILED', () => {
          getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_FAILED);
          expect(component.isStatusFail()).toBeTruthy();
        });
        it('should get true if STATUS_DECLINED', () => {
          getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);
          expect(component.isStatusFail()).toBeTruthy();
        });
      });
      describe('isStatusSuccess', () => {
        it('should get true if STATUS_ACCEPTED', () => {
          getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);
          expect(component.isStatusSuccess()).toBeTruthy();
        });
        it('should get true if STATUS_PAID', () => {
          getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_PAID);
          expect(component.isStatusSuccess()).toBeTruthy();
        });
        it('should get true if STATUS_IN_PROCESS', () => {
          getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);
          expect(component.isStatusSuccess()).toBeTruthy();
        });
      });
      describe('isStatusPending', () => {
        it('should get false', () => {
          expect(component.isStatusPending()).toBeFalsy();
        });
      });
      describe('isStatusUnknown', () => {
        it('should get true', () => {
          getPaymentStatus.mockReturnValue(PaymentStatusEnum.STATUS_CANCELLED);
          expect(component.isStatusUnknown()).toBeTruthy();
        });
      });
    });
  });

  describe('address transform', () => {
    const { billingAddress } = flowWithPaymentOptionsFixture();

    it('should get addressLine', () => {
      expect(component.addressLine()).toEqual(
        `${billingAddress.street}, ${billingAddress.zipCode}, ${billingAddress.country}, ${billingAddress.city}`
      );
    });

    it('should get billingAddressName', () => {
      expect(component.billingAddressName()).toEqual(
        `${SALUTATION_TRANSLATION[billingAddress.salutation]} ${billingAddress.firstName} ${billingAddress.lastName}`
      );
    });
  });

  describe('component', () => {
    it('should get canChangePaymentMethod', () => {
      jest.spyOn(ApiCallUrlService.prototype, 'canChangePaymentMethod').mockReturnValue(true);
      expect(component.canChangePaymentMethod()).toBeTruthy();
    });
    it('should handle onChangePaymentMethod', () => {
      jest.spyOn(component.changePaymentMethod, 'emit');
      component.onChangePaymentMethod();
      expect(component.changePaymentMethod.emit).toHaveBeenCalled();
    });
    it('should handle on close method', () => {
      jest.spyOn(component.closeButtonClicked, 'emit');
      component.onCloseMethod();
      expect(component.closeButtonClicked.emit).toHaveBeenCalled();
    });
    it('should handle on close', () => {
      jest.spyOn(component.close, 'emit');
      component.onClose();
      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    const flow = flowWithPaymentOptionsFixture();

    Object.defineProperty(window, 'location', {
      value: {
        href: null,
      },
      writable: true,
    });

    describe('emit santander status', () => {
      beforeEach(() => {
        jest.spyOn(_pluginEventsService, 'emitSantanderPaymentStatus').mockReturnValue(null);
      });

      it('should emitSantanderPaymentStatus with payment', () => {
        const payment = {
          apiCall: 'apiCall',
          status: PaymentStatusEnum.STATUS_IN_PROCESS,
        };
        fixture.componentRef.setInput('payment', payment);
        fixture.detectChanges();
        expect(_pluginEventsService.emitSantanderPaymentStatus).toHaveBeenCalledWith(
          payment.status,
          flow,
          payment.apiCall
        );
      });

      it('should emitSantanderPaymentStatus with nodeResult', () => {
        fixture.componentRef.setInput('nodeResult', paymentResponse);
        fixture.detectChanges();
        expect(_pluginEventsService.emitSantanderPaymentStatus).toHaveBeenCalledWith(
          paymentResponse.payment.status,
          flow,
          {}
        );
      });
    });

    describe('on status success', () => {
      let setHref: jest.SpyInstance;

      beforeEach(() => {
        jest.spyOn(component, 'getPaymentStatus').mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);
        jest.spyOn(component.cleanUp, 'next');
        setHref = jest.spyOn(TopLocationService.prototype, 'href', 'set').mockReturnValue(null);
      });

      const initInputs = (isShopRedirectEnabled = false) => {
        fixture.componentRef.setInput('payment', {
          apiCall: 'apiCall',
          status: PaymentStatusEnum.STATUS_ACCEPTED,
          shop_redirect_enabled: isShopRedirectEnabled,
        });
        jest.spyOn(component, 'isPosPayment').mockReturnValue(false);
        fixture.componentRef.setInput('embeddedMode', false);
        fixture.detectChanges();
      };

      afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useRealTimers();
        fixture.destroy();
      });

      it('should redirect to successUrl', fakeAsync(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });

        jest.spyOn(ApiCallUrlService.prototype, 'getSuccessUrl').mockReturnValue('successUrl');
        initInputs(true);

        jest.advanceTimersByTime(1000);
        expect(component.cleanUp.next).toHaveBeenCalledWith();
        expect(setHref).toHaveBeenCalledWith('successUrl');
      }));

      it('should add submit button', fakeAsync(() => {
        initInputs();

        jest.advanceTimersByTime(101);
        fixture.componentRef.setInput('isLoading', false);
        fixture.detectChanges();
        expect(component.buttons).toMatchObject({
          submit: {
            title: expect.any(String),
            classes: 'btn btn-primary btn-link',
            click: expect.any(Function),
          },
        });
      }));

      it('should submit click redirect to customerRedirectUrl', fakeAsync(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        jest.spyOn(ApiCallUrlService.prototype, 'getCustomerRedirectUrl').mockReturnValue('getCustomerRedirectUrl');
        initInputs();

        fixture.componentRef.setInput('isLoading', false);
        component.buttons?.submit.click !== 'close' && component.buttons?.submit.click();
        jest.advanceTimersByTime(1000);
        expect(setHref).toHaveBeenCalledWith('getCustomerRedirectUrl');
      }));

      it('should submit click redirect to successUrl', fakeAsync(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        jest.spyOn(ApiCallUrlService.prototype, 'getCustomerRedirectUrl').mockReturnValue(null);
        jest.spyOn(ApiCallUrlService.prototype, 'getSuccessUrl').mockReturnValue('successUrl');
        initInputs();

        fixture.componentRef.setInput('isLoading', false);
        component.buttons?.submit.click !== 'close' && component.buttons?.submit.click();
        jest.advanceTimersByTime(1000);
        expect(setHref).toHaveBeenCalledWith('successUrl');
      }));

      it('should submit click redirect to flow shopUrl', fakeAsync(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        jest.spyOn(ApiCallUrlService.prototype, 'getCustomerRedirectUrl').mockReturnValue(null);
        jest.spyOn(ApiCallUrlService.prototype, 'getSuccessUrl').mockReturnValue(null);
        initInputs();

        fixture.componentRef.setInput('isLoading', false);
        component.buttons?.submit.click !== 'close' && component.buttons?.submit.click();
        jest.advanceTimersByTime(1000);
        expect(setHref).toHaveBeenCalledWith(flow.shopUrl);
      }));
    });

    describe('on status fail', () => {
      let setHref: jest.SpyInstance;

      beforeEach(() => {
        jest.spyOn(component, 'getPaymentStatus').mockReturnValue(PaymentStatusEnum.STATUS_FAILED);
        jest.spyOn(component.cleanUp, 'next');
        setHref = jest.spyOn(TopLocationService.prototype, 'href', 'set').mockReturnValue(null);
      });

      const initInputs = (isShopRedirectEnabled = false) => {
        fixture.componentRef.setInput('payment', {
          apiCall: 'apiCall',
          status: PaymentStatusEnum.STATUS_FAILED,
          shop_redirect_enabled: isShopRedirectEnabled,
        });
        jest.spyOn(component, 'isPosPayment').mockReturnValue(false);
        fixture.componentRef.setInput('embeddedMode', false);
        fixture.detectChanges();
      };

      afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useRealTimers();
        fixture.destroy();
      });

      it('should redirect to failureUrl', fakeAsync(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });

        jest.spyOn(ApiCallUrlService.prototype, 'getFailureUrl').mockReturnValue('failureUrl');
        initInputs(true);

        jest.advanceTimersByTime(1000);
        expect(component.cleanUp.next).toHaveBeenCalledWith();
        expect(setHref).toHaveBeenCalledWith('failureUrl');
      }));

      it('should add submit button if can change payment', () => {
        jest.spyOn(component, 'onChangePaymentMethod').mockReturnValue(null);
        jest.spyOn(ApiCallUrlService.prototype, 'canChangePaymentMethod').mockReturnValue(true);
        fixture.componentRef.setInput('showCloseButton', false);
        initInputs();

        fixture.componentRef.setInput('isLoading', false);
        fixture.detectChanges();
        expect(component.buttons).toMatchObject({
          submit: {
            title: expect.any(String),
            classes: 'btn btn-primary btn-link',
            click: expect.any(Function),
          },
        });
        component.buttons?.submit.click !== 'close' && component.buttons?.submit.click();
        expect(component.onChangePaymentMethod).toHaveBeenCalled();
      });

      it('should add cancel button if show close button', () => {
        jest.spyOn(component, 'onCloseMethod').mockReturnValue(null);
        jest.spyOn(ApiCallUrlService.prototype, 'canChangePaymentMethod').mockReturnValue(false);
        fixture.componentRef.setInput('showCloseButton', true);
        initInputs();

        fixture.componentRef.setInput('isLoading', false);
        fixture.detectChanges();
        expect(component.buttons).toMatchObject({
          cancel: {
            title: expect.any(String),
            classes: 'btn btn-primary btn-link',
            click: expect.any(Function),
          },
        });
        component.buttons?.cancel.click !== 'close' && component.buttons?.cancel.click();
        expect(component.onCloseMethod).toHaveBeenCalled();
      });
    });

    describe('on status pending', () => {
      let setHref: jest.SpyInstance;

      beforeEach(() => {
        jest.spyOn(component, 'getPaymentStatus').mockReturnValue(PaymentStatusEnum.STATUS_NEW);
        jest.spyOn(component, 'isStatusPending').mockReturnValue(true);
        jest.spyOn(component.cleanUp, 'next');
        setHref = jest.spyOn(TopLocationService.prototype, 'href', 'set').mockReturnValue(null);
      });

      const initInputs = (isShopRedirectEnabled = false) => {
        fixture.componentRef.setInput('payment', {
          apiCall: 'apiCall',
          status: PaymentStatusEnum.STATUS_NEW,
          shop_redirect_enabled: isShopRedirectEnabled,
        });
        jest.spyOn(component, 'isPosPayment').mockReturnValue(false);
        fixture.componentRef.setInput('embeddedMode', false);
        fixture.detectChanges();
      };

      afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useRealTimers();
        fixture.destroy();
      });

      it('should redirect to pendingUrl', fakeAsync(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });

        jest.spyOn(ApiCallUrlService.prototype, 'getPendingUrl').mockReturnValue('pendingUrl');
        initInputs(true);

        jest.advanceTimersByTime(1000);
        expect(component.cleanUp.next).toHaveBeenCalledWith();
        expect(setHref).toHaveBeenCalledWith('pendingUrl');
      }));

      it('should add submit button', fakeAsync(() => {
        initInputs();

        jest.advanceTimersByTime(101);
        fixture.componentRef.setInput('isLoading', false);
        fixture.detectChanges();
        expect(component.buttons).toMatchObject({
          submit: {
            title: expect.any(String),
            classes: 'btn btn-primary btn-link',
            click: expect.any(Function),
          },
        });
      }));

      it('should submit click redirect to customerRedirectPendingUrl', fakeAsync(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        jest
          .spyOn(ApiCallUrlService.prototype, 'getCustomerRedirectPendingUrl')
          .mockReturnValue('customerRedirectPendingUrl');
        initInputs();

        fixture.componentRef.setInput('isLoading', false);
        component.buttons?.submit.click !== 'close' && component.buttons?.submit.click();
        jest.advanceTimersByTime(1000);
        expect(setHref).toHaveBeenCalledWith('customerRedirectPendingUrl');
      }));

      it('should submit click redirect to flow shopUrl', fakeAsync(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        jest.spyOn(ApiCallUrlService.prototype, 'getCustomerRedirectPendingUrl').mockReturnValue(null);
        initInputs();

        fixture.componentRef.setInput('isLoading', false);
        component.buttons?.submit.click !== 'close' && component.buttons?.submit.click();
        jest.advanceTimersByTime(1000);
        expect(setHref).toHaveBeenCalledWith(flow.shopUrl);
      }));
    });
  });
});
