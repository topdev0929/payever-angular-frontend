import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import {
  FinishStatusFailComponent,
  FinishStatusPendingComponent,
  FinishStatusSuccessComponent,
  FinishStatusUnknownComponent,
  FinishWrapperComponent,
} from '@pe/checkout/finish/components';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  SetFlow,
  SetPaymentComplete,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { ZiniaBNPLFinishModuleV2 } from '../zinia-bnpl-finish.module';

import { FinishComponent } from './finish.component';

describe('zinia-bnpl-finish-v2', () => {
  let store: Store;

  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(ZiniaBNPLFinishModuleV2),
        RouterModule.forRoot([]),
      ],
      providers: [
        importProvidersFrom(FinishComponent),
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
      ],
      declarations: [
        MockComponent(FinishComponent),
        FinishComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(FinishComponent);
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
      expect(component instanceof AbstractFinishComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should render checkout-sdk-finish-status-success when stats is success', () => {
      fixture.componentRef.setInput(
        'nodeResult',
        PaymentResponseWithStatus(
          PaymentStatusEnum.STATUS_ACCEPTED,
          null,
        )
      );
      fixture.detectChanges();
      QueryChildByDirective(fixture, FinishStatusSuccessComponent);
    });

    it('should close otp', () => {
      const closeFinishDialogService = jest.spyOn(component['finishDialogService'], 'close');
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(null);
      const setPaymentLoading = jest.spyOn(component['paymentHelperService'], 'setPaymentLoading');
      component.closeOtp();
      expect(closeFinishDialogService).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(new SetPaymentComplete(false));
      expect(setPaymentLoading).toHaveBeenCalledWith(false);
    });

    it('should render checkout-sdk-finish-status-pending when stats is pending', () => {
      fixture.componentRef.setInput(
        'nodeResult',
        PaymentResponseWithStatus(
          PaymentStatusEnum.STATUS_IN_PROCESS,
          null,
        )
      );
      fixture.detectChanges();
      QueryChildByDirective(fixture, FinishStatusPendingComponent);
    });

    it('should render checkout-sdk-finish-status-fail when stats is fail', () => {
      fixture.componentRef.setInput(
        'nodeResult',
        PaymentResponseWithStatus(
          PaymentStatusEnum.STATUS_FAILED,
          null,
        )
      );
      fixture.detectChanges();
      QueryChildByDirective(fixture, FinishStatusFailComponent);
    });

    it('should render checkout-sdk-finish-status-unknown when stats is Unknown', () => {
      fixture.componentRef.setInput(
        'nodeResult',
        PaymentResponseWithStatus(
          null,
          null,
        )
      );
      fixture.detectChanges();
      QueryChildByDirective(fixture, FinishStatusUnknownComponent);
    });

    it('Should render finish-wrapper with proper inputs', () => {
      const { child: finishWrapper } = QueryChildByDirective(fixture, FinishWrapperComponent);
      expect(finishWrapper.buttons).toEqual(component.buttons);
      expect(finishWrapper.errorMessage).toEqual(component.errorMessage);
      expect(finishWrapper.iframeCallbackUrl).toEqual(component.getIframeCallbackUrl());
      expect(finishWrapper.isLoading).toEqual(component.isLoading);
      expect(finishWrapper.isChangingPaymentMethod).toEqual(component.isChangingPaymentMethod);
      expect(finishWrapper.embeddedMode).toEqual(component.embeddedMode);
      expect(finishWrapper.merchantMode).toEqual(component.merchantMode);
      expect(finishWrapper.isDisableChangePayment).toEqual(component.isDisableChangePayment);
    });

    const expectStatus = (shouldReturnTrue: PaymentStatusEnum[], fn: () => boolean) => {
      jest.spyOn(FinishComponent.prototype, 'isOtpVerify').mockReturnValue(false);
      const statusSpy = jest.spyOn(FinishComponent.prototype, 'status', 'get');
      const shouldReturnFalse = [
        ...Object.values(PaymentStatusEnum)
          .filter(status => !shouldReturnTrue.includes(status)),
      ];
      const cases = [
        ...shouldReturnTrue.map(status => ({ status, expected: true })),
        ...shouldReturnFalse.map(status => ({ status, expected: false })),
      ];

      cases.forEach(({ status, expected }) => {
        it(`should return ${expected} for ${status}`, () => {
          statusSpy.mockReturnValue(status);
          expect(fn()).toEqual(expected);
        });
      });
    };
    describe('isStatusPending', () => {
      const shouldReturnTrue = [
        PaymentStatusEnum.STATUS_IN_PROCESS,
      ];
      expectStatus(shouldReturnTrue, () => component.isStatusPending());

      it('Should enforce pending status with isStatusTimeout', () => {
        jest.spyOn(FinishComponent.prototype, 'status', 'get')
          .mockReturnValue(PaymentStatusEnum.STATUS_CANCELLED);
        component.isStatusTimeout = true;
        expect(component.isStatusPending()).toEqual(true);
      });
    });
    describe('isStatusFail', () => {
      const shouldReturnTrue = [
        PaymentStatusEnum.STATUS_FAILED,
        PaymentStatusEnum.STATUS_DECLINED,
      ];
      expectStatus(shouldReturnTrue, () => component.isStatusFail());
    });
    describe('isStatusSuccess', () => {
      const shouldReturnTrue = [
        PaymentStatusEnum.STATUS_ACCEPTED,
        PaymentStatusEnum.STATUS_PAID,
      ];
      expectStatus(shouldReturnTrue, () => component.isStatusSuccess());
    });

    it('isOtpVerify', () => {
      jest.spyOn(FinishComponent.prototype, 'isOtpVerify').mockReset();
      jest.spyOn(component, 'status', 'get').mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);
      const nodeResult = PaymentResponseWithStatus(null, null);
      component.nodeResult = {
        ...nodeResult,
        paymentDetails: {
          verifyValue: '123456',
        },
      };

      expect(component.isOtpVerify()).toBe(true);
    });
  });
});
