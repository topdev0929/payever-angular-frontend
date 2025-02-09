import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import {
  FinishStatusFailComponent,
  FinishStatusSuccessComponent,
  FinishStatusUnknownComponent,
  FinishWrapperComponent,
} from '@pe/checkout/finish/components';
import {
  FlowState,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { SharedModule } from '../../shared.module';

import { FinishComponent } from './finish.component';

describe.only('stripe-ideal-shared-finish', () => {
  let store: Store;

  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        importProvidersFrom(SharedModule),
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        MockComponents(
          FinishWrapperComponent,
          FinishStatusSuccessComponent,
          FinishStatusFailComponent,
          FinishStatusUnknownComponent,
        ),
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

    it('Should return details on getNodeResultDetails', () => {
      const nodeResult = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_ACCEPTED,
        null,
      );
      nodeResult.paymentDetails = {
        some_value: 'some_value',
      };
      fixture.componentRef.setInput('nodeResult', nodeResult);
      fixture.detectChanges();
      expect(component.getNodeResultDetails()).toEqual(nodeResult.paymentDetails);
    });

    describe('checkout-sdk-finish-status-success', () => {
      const nodeResult = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_ACCEPTED,
        null,
      );
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
        expect(child.transactionLink).toEqual(
          component.isCanShowTransactionLink() ? component.transactionLink : null
        );
        expect(child.flowId).toEqual(flow?.id);
        expect(child.isPosPayment).toEqual(component.isPosPayment());
      });
    });

    it('should render checkout-sdk-finish-status-success when stats is pending', () => {
      fixture.componentRef.setInput(
        'nodeResult',
        PaymentResponseWithStatus(
          PaymentStatusEnum.STATUS_IN_PROCESS,
          null,
        )
      );
      fixture.detectChanges();
      QueryChildByDirective(fixture, FinishStatusSuccessComponent);
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

    describe.only('isStatusSuccess', () => {
      const shouldReturnTrue = [
        PaymentStatusEnum.STATUS_ACCEPTED,
        PaymentStatusEnum.STATUS_PAID,
      ];
      expectStatus(shouldReturnTrue, () => component.isStatusSuccess());
    });
    describe('isStatusPending', () => {
      const shouldReturnTrue = [
        PaymentStatusEnum.STATUS_IN_PROCESS,
      ];
      expectStatus(shouldReturnTrue, () => component.isStatusPending());
    });
    describe('isStatusFail', () => {
      const shouldReturnTrue = [
        PaymentStatusEnum.STATUS_FAILED,
        PaymentStatusEnum.STATUS_DECLINED,
      ];
      expectStatus(shouldReturnTrue, () => component.isStatusFail());
    });

    describe('isStatusNew', () => {
      const shouldReturnTrue = [
        PaymentStatusEnum.STATUS_NEW,
      ];
      expectStatus(shouldReturnTrue, () => component.isStatusNew());
    });
  });
});

