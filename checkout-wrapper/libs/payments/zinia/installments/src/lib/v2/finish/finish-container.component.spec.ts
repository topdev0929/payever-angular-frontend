import { HttpErrorResponse } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { FinishModule } from '@pe/checkout/finish';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  FlowState,
  ParamsState,
  SetFlow,
  SetPaymentError,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { PaymentStatusEnum, ResponseErrorsInterface } from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../test/fixtures';
import { FinishComponent, OpenbankFlowService } from '../shared';

import { FinishContainerComponent } from './finish-container.component';
import { ZiniaInstallmentsV2FinishModule } from './finish.module';


describe('zinia-finish-container-v2', () => {
  let store: Store;
  const verifyOtp$ = new BehaviorSubject(null);

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(FinishModule),
        RouterModule.forRoot([]),
      ],
      providers: [
        importProvidersFrom(ZiniaInstallmentsV2FinishModule),
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
    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.verifyOtp$.subscribe(verifyOtp$);
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
    const merchantMode = store.selectSnapshot(ParamsState.merchantMode);

    expect(finishComponent.errorMessage).toEqual(component.errorMessage);
    expect(finishComponent.embeddedMode).toEqual(embeddedMode);
    expect(finishComponent.merchantMode).toEqual(merchantMode);
    expect(finishComponent.showCloseButton).toEqual(!!flow.apiCall.cancelUrl);
    expect(finishComponent.showChangePaymentButton).toEqual(component.showChangePaymentButton);
    expect(finishComponent.isDisableChangePayment).toEqual(component.isDisableChangePayment);
    expect(finishComponent.nodeResult).toEqual(component.paymentResponse);
    expect(finishComponent.isLoading).toEqual(!component.paymentResponse && !component.errorMessage);
  };

  describe('component', () => {
    it('should provide inputs to the finishComponent, correctly', () => {
      checkChildInputs();
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

    it('Should call tryAgain when tryAgain emits', () => {
      const tryAgain = jest.spyOn(component, 'tryAgain')
        .mockReturnValue();
      const { childEl } = QueryChildByDirective(fixture, FinishComponent);
      childEl.triggerEventHandler('tryAgain');
      expect(tryAgain).toHaveBeenCalled();
    });

    it('Should call close when closeButtonClicked emits', () => {
      const close = jest.spyOn(component, 'close')
        .mockReturnValue();
      const { childEl } = QueryChildByDirective(fixture, FinishComponent);
      childEl.triggerEventHandler('close');
      expect(close).toHaveBeenCalled();
    });

    it('Should call close when close emits', () => {
      const href = jest.spyOn(TopLocationService.prototype, 'href', 'set')
        .mockReturnValue();
      const close = jest.spyOn(component, 'close');
      const { childEl } = QueryChildByDirective(fixture, FinishComponent);
      childEl.triggerEventHandler('close');
      expect(close).toHaveBeenCalled();
      expect(href).toHaveBeenCalledWith(component.flow.apiCall.cancelUrl);
    });

    it('Should call close when close emits', () => {
      const otpCodeReady = jest.spyOn(component, 'otpCodeReady')
        .mockReturnValue();
      const { childEl } = QueryChildByDirective(fixture, FinishComponent);
      childEl.triggerEventHandler('otpCodeReady', '207');
      expect(otpCodeReady).toHaveBeenCalledWith('207');
    });

    it('Should emit verifyOTP on otpCodeReady', () => {
      const nodeResult = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        null,
      );
      component.paymentResponse = nodeResult;
      jest.spyOn(OpenbankFlowService.prototype, 'optVerify').mockReturnValue(of(nodeResult));
      jest.spyOn(NodeFlowService.prototype, 'getFinalResponse').mockReturnValue(nodeResult);
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      const res = component.verifyOtp$.pipe(
        take(1),
        tap((otp) => {
          expect(otp).toEqual({ status: 'loading' });
        })
      ).toPromise();
      finishComponent.otpCodeReady.emit('1234');

      return res;
    });

    it('should should handle optVerify error', () => {
      const nodeResult = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        null,
      );
      component.paymentResponse = nodeResult;
      const error = {
        code: 120,
      };
      jest.spyOn(OpenbankFlowService.prototype, 'optVerify').mockReturnValue(throwError(error));
      jest.spyOn(NodeFlowService.prototype, 'getFinalResponse').mockReturnValue(nodeResult);
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      const res = component.verifyOtp$.pipe(
        take(1),
        tap((otp) => {
          expect(otp).toEqual({ code: error.code, status: 'error' });
        })
      ).toPromise();
      finishComponent.otpCodeReady.emit('1234');

      return res;
    });

    it('should should handle optVerify status code error', () => {
      const nodeResult = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        null,
      );
      component.paymentResponse = nodeResult;
      const error = {
        statusCode: 100,
      };
      jest.spyOn(OpenbankFlowService.prototype, 'optVerify').mockReturnValue(throwError(error));
      jest.spyOn(NodeFlowService.prototype, 'getFinalResponse').mockReturnValue(nodeResult);
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      const res = component.verifyOtp$.pipe(
        take(1),
        tap((otp) => {
          expect(otp).toEqual({ code: error.statusCode, status: 'error' });
        })
      ).toPromise();
      finishComponent.otpCodeReady.emit('1234');

      return res;
    });


  });
});
