import { HttpErrorResponse } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';
import { interval, of, throwError } from 'rxjs';
import * as rxjs from 'rxjs';

import { FinishModule } from '@pe/checkout/finish';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  FlowState,
  ParamsState,
  PatchPaymentResponse,
  SetFlow,
  SetPaymentError,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import {
  ChangePaymentDataInterface,
  FlowStateEnum,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';

import { FinishComponent } from '../shared';
import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../test/fixtures';

import { FinishContainerComponent } from './finish-container.component';
import { StripeWalletFinishModule } from './stripe-wallet-finish.module';

describe('stripe-wallet-finish-container', () => {
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
        importProvidersFrom(StripeWalletFinishModule),
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
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

    expect(finishComponent.errorMessage).toEqual(component.errorMessage);
  };

  describe('component', () => {
    it('should provide inputs to the finishComponent, correctly', () => {
      component.paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);

      component.cdr.detectChanges();

      checkChildInputs();
    });

    it('should hide the finishComponent', () => {
      component.stripeError = 'Error';
      const childEl = fixture.debugElement.query(By.directive(FinishComponent));

      expect(childEl).toBeFalsy();
    });

    it('should showFinishModalFromExistingPayment', () => {
      store.dispatch(new PatchPaymentResponse(PaymentResponseWithStatus(PaymentStatusEnum.STATUS_NEW, null)));

      const runStatusCheck = jest.spyOn(component as any, 'runStatusCheck');

      component.showFinishModalFromExistingPayment();

      component['stripeFlowService'].confirmCardPayment$.subscribe({
        next: () => {
          expect(runStatusCheck).toHaveBeenCalled();
        },
      });
    });

    it('should confirmCardPaymentLoading$ return true', (done) => {
      component['stripeFlowService'].confirmCardPayment$.next({ inProgress: true });
      component['confirmCardPaymentLoading$'].subscribe((loading) => {
        expect(loading).toBeTruthy();

        done();
      });
    });

    it('should confirmCardPaymentLoading$ return false', (done) => {
      component['stripeFlowService'].confirmCardPayment$.next({ inProgress: false });
      component['confirmCardPaymentLoading$'].subscribe((loading) => {
        expect(loading).toBeFalsy();

        done();
      });
    });

    it('should call tryAgain on tryAgain', () => {
      component.paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
      component.cdr.detectChanges();
      const tryAgain = jest.spyOn(component, 'tryAgain');
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      finishComponent.tryAgain.emit();
      expect(tryAgain).toHaveBeenCalled();
    });

    it('should call colse on close', () => {
      component.paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
      component.cdr.detectChanges();

      const close = jest.spyOn(component, 'close').mockReturnValue(null);
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      finishComponent.close.emit();
      expect(close).toHaveBeenCalled();
    });

    it('should call changePayment on changePaymentMethod', () => {
      component.paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
      component.cdr.detectChanges();

      const changePayment = jest.spyOn(component, 'changePayment');
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      const e: ChangePaymentDataInterface = { redirectUrl: 'redirect-url' };
      finishComponent.changePaymentMethod.emit(e);
      expect(changePayment).toHaveBeenCalledWith(e);
    });

    it('should runStatusCheck if processed', (done) => {
      jest.spyOn(rxjs, 'interval').mockReturnValue(interval(100));
      const activatedRoute = TestBed.inject(ActivatedRoute);
      activatedRoute.queryParams = of({ processed: true });
      jest.spyOn(component, 'flow', 'get').mockReturnValue({
        state: FlowStateEnum.FINISH,
      });
      const finalResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(finalResponse);
      component['runStatusCheck']();
      const paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValueOnce(of(
          PaymentResponseWithStatus(PaymentStatusEnum.STATUS_NEW, null),
        ))
        .mockReturnValueOnce(of(paymentResponse));

      setTimeout(() => {
        expect(updatePayment).toBeCalledTimes(2);
        expect(component.isCheckStatusProcessing).toBe(false);
        expect(component.isCheckStatusTimeout).toBe(false);
        expect(component.paymentResponse).toEqual(paymentResponse);
        done();
      }, 400);
    });

    it('should runStatusCheck handle if time is more then allowed', (done) => {
      const paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
      TestBed.inject(ActivatedRoute).queryParams = of({ processed: true });
      jest.spyOn(rxjs, 'interval').mockReturnValue(interval(100));
      jest.spyOn(component, 'flow', 'get').mockReturnValue({
        state: FlowStateEnum.FINISH,
      });
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(paymentResponse);

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

    it('should runStatusCheck if throwError', (done) => {
      jest.spyOn(rxjs, 'interval').mockReturnValue(interval(100));
      const activatedRoute = TestBed.inject(ActivatedRoute);
      activatedRoute.queryParams = of({ processed: true });
      jest.spyOn(component, 'flow', 'get').mockReturnValue({
        state: FlowStateEnum.FINISH,
      });
      const finalResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(finalResponse);
      component['runStatusCheck']();
      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValueOnce(throwError(new Error('error')));

      setTimeout(() => {
        expect(updatePayment).toBeCalledTimes(1);
        expect(component.isCheckStatusProcessing).toBe(false);
        expect(component.isCheckStatusTimeout).toBe(false);

        done();
      }, 200);
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
      component.cdr.detectChanges();

      expect(component.errorMessage).toEqual('errorMessage');
    });
  });
});
