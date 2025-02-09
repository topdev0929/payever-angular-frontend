import { HttpErrorResponse } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';
import * as rxjs from 'rxjs';
import { interval, of, throwError } from 'rxjs';

import { FinishModule } from '@pe/checkout/finish';
import { NodeFlowService } from '@pe/checkout/node-api';
import {
  ExternalNavigateData,
  ExternalRedirectStorage,
  FlowStorage,
  PaymentInquiryStorage,
} from '@pe/checkout/storage';
import { FlowState, ParamsState, SetFlow, SetPaymentError } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import {
  ChangePaymentDataInterface,
  FlowInterface,
  FlowStateEnum,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';

import { FinishComponent, StripeCommonService } from '../shared';
import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../test/fixtures';

import { FinishContainerComponent } from './finish-container.component';
import { StripeIdealFinishModule } from './stripe-ideal-finish.module';

describe('stripe-ideal-finish-container', () => {
  let store: Store;

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(FinishModule),
      ],
      providers: [
        importProvidersFrom(StripeIdealFinishModule),
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        ExternalNavigateData,
      ],
      declarations: [
        MockComponent(FinishComponent),
        FinishContainerComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    nodeFlowService = TestBed.inject(NodeFlowService);
    fixture = TestBed.createComponent(FinishContainerComponent);
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

  const checkChildInputs = () => {
    const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
    expect(finishComponent).toBeTruthy();

    const flow = store.selectSnapshot(FlowState.flow);
    const embeddedMode = store.selectSnapshot(ParamsState.embeddedMode);

    expect(finishComponent.embeddedMode).toEqual(embeddedMode);
    expect(finishComponent.nodeResult).toEqual(component.paymentResponse);
    expect(finishComponent.showCloseButton).toEqual(!!flow.apiCall.cancelUrl);
    expect(finishComponent.isLoading).toEqual(!component.paymentResponse && !component.errorMessage);
    expect(finishComponent.errorMessage).toEqual(component.errorMessage);
  };

  describe('component', () => {
    it('should provide inputs to the finishComponent, correctly', () => {
      checkChildInputs();
    });

    it('Should call tryAgain on tryAgain', () => {
      const tryAgain = jest.spyOn(component, 'tryAgain');
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      finishComponent.tryAgain.emit();
      expect(tryAgain).toHaveBeenCalled();
    });

    it('Should call colse on close', () => {
      const close = jest.spyOn(component, 'close').mockReturnValue(null);
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      finishComponent.close.emit();
      expect(close).toHaveBeenCalled();
    });

    it('Should call changePayment on changePaymentMethod', () => {
      const changePayment = jest.spyOn(component, 'changePayment');
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      const e: ChangePaymentDataInterface = { redirectUrl: 'redirect-url' };
      finishComponent.changePaymentMethod.emit(e);
      expect(changePayment).toHaveBeenCalledWith(e);
    });

    it('should set error message', () => {
      const error: ResponseErrorsInterface = {
        code: 400,
        errors: {
          error: 'error',
        },
        message: 'errorMessage',
        raw: new HttpErrorResponse({ status: 400 }),
      };

      store.dispatch(new SetPaymentError(error));
      fixture.detectChanges();

      expect(component.errorMessage).toEqual('errorMessage');
      checkChildInputs();
    });
  });

  describe('runStatusCheck', () => {
    const paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);

    beforeEach(() => {
      TestBed.inject(ActivatedRoute).queryParams = of({ processed: true });
      jest.spyOn(rxjs, 'interval').mockReturnValue(interval(100));
      jest.spyOn(component, 'flow', 'get').mockReturnValue({
        state: FlowStateEnum.FINISH,
      });
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(paymentResponse);
    });

    it('Should runStatusCheck if processed', (done) => {
      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValueOnce(of(
          PaymentResponseWithStatus(PaymentStatusEnum.STATUS_NEW, null),
        ))
        .mockReturnValueOnce(of(paymentResponse));

      component['runStatusCheck']();

      setTimeout(() => {
        expect(updatePayment).toBeCalledTimes(2);
        expect(component.isLoading).toBe(false);
        expect(component.isCheckStatusTimeout).toBe(false);
        expect(component.paymentResponse).toEqual(paymentResponse);
        done();
      }, 400);
    });

    it('Should runStatusCheck handle if date.now more then allowed', (done) => {
      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValueOnce(of(
          PaymentResponseWithStatus(PaymentStatusEnum.STATUS_NEW, null),
        ))
        .mockReturnValueOnce(of(paymentResponse));
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(180 * 1000 + 1);

      component['runStatusCheck']();

      setTimeout(() => {
        expect(updatePayment).toHaveBeenCalled();
        expect(component.isCheckStatusTimeout).toBe(true);
        done();
      }, 400);
    });

    it('Should runStatusCheck handle error', (done) => {
      const errors = {
        code: 400,
        errors: {
          error: 'test-error',
        },
        message: 'error-message',
        raw: {
          error: {
            message: 'raw-error-message',
          },
        },
      };
      jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(throwError(errors));

      component['runStatusCheck']();

      setTimeout(() => {
        expect(component.errors).toEqual(errors.errors);
        expect(component.isLoading).toBe(false);
        expect(component.isCheckStatusTimeout).toBe(false);
        expect(component.errorMessage).toEqual(errors.raw.error.message);
        done();
      }, 400);
    });

    it('Should runStatusCheck handle error without error raw message', (done) => {
      const errors: ResponseErrorsInterface = {
        code: 400,
        errors: {
          error: 'test-error',
        },
        message: 'error-message',
        raw: null,
      };
      jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(throwError(errors));

      component['runStatusCheck']();

      setTimeout(() => {
        expect(component.errors).toEqual(errors.errors);
        expect(component.isLoading).toBe(false);
        expect(component.isCheckStatusTimeout).toBe(false);
        expect(component.errorMessage).toEqual(errors.message);
        done();
      }, 400);
    });
  });

  describe('showFinishModalFromExistingPayment', () => {
    let initStripe: jest.SpyInstance;
    let runStatusCheck: jest.SpyInstance;

    beforeEach(() => {
      jest.spyOn(component, 'flow', 'get').mockReturnValue({
        state: FlowStateEnum.FINISH,
      });
      TestBed.inject(ActivatedRoute).queryParams = of({ processed: false });

      initStripe = jest.spyOn(component, 'initStripe');
      runStatusCheck = jest.spyOn(component as any, 'runStatusCheck');
    });

    it('should showFinishModalFromExistingPayment initStripe', () => {
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(PaymentResponseWithStatus(PaymentStatusEnum.STATUS_NEW, null));

      component.showFinishModalFromExistingPayment();
      expect(initStripe).toHaveBeenCalled();
      expect(runStatusCheck).not.toHaveBeenCalled();
    });

    it('should showFinishModalFromExistingPayment runStatusCheck if status is not new', () => {
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null));

      component.showFinishModalFromExistingPayment();
      expect(initStripe).not.toHaveBeenCalled();
      expect(runStatusCheck).toHaveBeenCalled();
    });
  });

  describe('initStripe', () => {
    const finalResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_NEW, null);
    const mountElement = jest.fn();
    const onElement = jest.fn((_, callBack) => {
      callBack();
    });
    const createElement = jest.fn(() => ({
      mount: mountElement,
      on: onElement,
    }));
    let flow: FlowInterface = null;
    let saveDataBeforeRedirect: jest.SpyInstance;
    let getData: jest.SpyInstance;
    let initStripe: jest.SpyInstance;

    beforeEach(() => {
      flow = store.selectSnapshot(FlowState.flow);
      jest.spyOn(component, 'flow', 'get').mockReturnValue({
        ...flow,
        state: FlowStateEnum.FINISH,
      });
      initStripe = jest.spyOn(component, 'initStripe');
      saveDataBeforeRedirect = jest.spyOn(ExternalRedirectStorage.prototype, 'saveDataBeforeRedirect')
        .mockReturnValue(of(null));
      getData = jest.spyOn(TestBed.inject(FlowStorage), 'getData')
        .mockReturnValue('idealBankValue');
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(finalResponse);
    });

    it('Should initStripe for new payments', () => {
      const stripe = {
        confirmIdealPayment: jest.fn(() => Promise.resolve(null)),
        elements: jest.fn(() => ({
          create: createElement,
        })),
      };
      jest.spyOn(TestBed.inject(StripeCommonService), 'initStripe')
        .mockReturnValue(of(stripe as any));

      component.ngOnInit();

      expect(initStripe).toHaveBeenCalled();
      expect(stripe.elements).toBeCalled();
      expect(getData).toBeCalled();
      expect(createElement).toBeCalledWith('idealBank', { value: 'idealBankValue' });
      expect(mountElement).toBeCalledWith('#ideal-bank-element-finish');
      expect(onElement).toBeCalledWith('ready', expect.any(Function));
      expect(saveDataBeforeRedirect).toBeCalled();
      expect(stripe.confirmIdealPayment).toBeCalledWith(
        finalResponse.paymentDetails.clientSecret,
        {
          payment_method: {
            ideal: expect.any(Object),
            billing_details: {
              name: `${flow.billingAddress.firstName} ${flow.billingAddress.lastName}`.trim(),
            },
          },
          return_url: finalResponse.paymentDetails.postbackUrl,
        },
      );
    });

    it('Should initStripe handle confirmIdealPayment error', fakeAsync(() => {
      const error = new Error('test');
      const stripe = {
        confirmIdealPayment: jest.fn().mockRejectedValue(error),
        elements: jest.fn(() => ({
          create: createElement,
        })),
      };
      jest.spyOn(TestBed.inject(StripeCommonService), 'initStripe')
        .mockReturnValue(of(stripe as any));

      component.ngOnInit();

      tick();
      expect(component.errors).toEqual(error);
      expect(component.errorMessage).toEqual(error.message);
    }));
  });

});
