
import { HttpErrorResponse } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { FinishModule } from '@pe/checkout/finish';
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
import { ZiniaBnplFlowService } from '../services';

import { FinishComponent } from './finish';
import { FinishContainerComponent } from './finish-container.component';
import { ZiniaBNPLFinishModuleV4 } from './zinia-bnpl-finish.module';

describe('zinia-bnpl-finish-container-v4', () => {
  let store: Store;

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
        importProvidersFrom(ZiniaBNPLFinishModuleV4),
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

    expect(finishComponent.embeddedMode).toEqual(embeddedMode);
    expect(finishComponent.merchantMode).toEqual(merchantMode);
    expect(finishComponent.isDisableChangePayment).toEqual(component.isDisableChangePayment);
    expect(finishComponent.nodeResult).toEqual(component.paymentResponse);
    expect(finishComponent.showCloseButton).toEqual(!!flow.apiCall.cancelUrl);
    expect(finishComponent.isLoading).toEqual(!component.paymentResponse && !component.errorMessage);
    expect(finishComponent.errorMessage).toEqual(component.errorMessage);
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

    it('Should emit verifyOTP on otpCodeReady', () => {
      const nodeResult = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        null,
      );
      component.paymentResponse = nodeResult;
      jest.spyOn(ZiniaBnplFlowService.prototype, 'optVerify').mockReturnValue(of(nodeResult));
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
      jest.spyOn(ZiniaBnplFlowService.prototype, 'optVerify').mockReturnValue(throwError(error));
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
      jest.spyOn(ZiniaBnplFlowService.prototype, 'optVerify').mockReturnValue(throwError(error));
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
