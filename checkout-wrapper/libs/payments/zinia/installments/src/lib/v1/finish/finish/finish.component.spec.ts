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
  FlowState,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { ZiniaInstallmentsV1FinishModule } from '../finish.module';

import { FinishComponent } from './finish.component';

describe('zinia-finish-v1', () => {
  let store: Store;

  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(ZiniaInstallmentsV1FinishModule),
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
    describe('checkout-sdk-finish-status-success', () => {
      const nodeResult = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_ACCEPTED,
        null,
      );
      nodeResult.paymentDetails = {
        mandateUrl: 'mandate-url',
      };
      beforeEach(() => {
        fixture.componentRef.setInput('nodeResult', nodeResult);
        fixture.detectChanges();
      });

      it('should render checkout-sdk-finish-status-success when stats is success', () => {
        QueryChildByDirective(fixture, FinishStatusSuccessComponent);
      });

      it('Should set inputs properly', () => {
        const flow = store.selectSnapshot(FlowState.flow);
        const { child } = QueryChildByDirective(fixture, FinishStatusSuccessComponent);
        expect(child.total).toEqual(nodeResult.payment.total);
        expect(child.currency).toEqual(nodeResult.payment.currency);
        expect(child.storeName).toEqual(nodeResult.payment.businessName);
        expect(child.createdAt).toEqual(nodeResult.createdAt);
        expect(child.billingAddressName).toEqual(
          component.isPosPayment() ? component.billingAddressName() : null
        );
        expect(child.orderId).toEqual(component.orderId);
        expect(child.applicationNumber).toEqual(component.applicationNumber);
        expect(child.transactionLink).toEqual(
          component.isCanShowTransactionLink() ? component.transactionLink : null
        );
        expect(child.flowId).toEqual(flow?.id);
      });
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
          PaymentStatusEnum.STATUS_CANCELLED,
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
        PaymentStatusEnum.STATUS_NEW,
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
        PaymentStatusEnum.STATUS_CANCELLED,
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
  });
});

