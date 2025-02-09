import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import * as rxjs from 'rxjs';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import {
  FinishStatusFailComponent,
  FinishStatusSuccessComponent,
  FinishStatusUnknownComponent,
  FinishWrapperComponent,
} from '@pe/checkout/finish/components';
import { SafeUrlPipe } from '@pe/checkout/plugins';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { SharedModule } from '../../shared.module';

import { FinishComponent } from './finish.component';

describe.only('stripe-shared-finish', () => {
  let store: Store;

  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        SafeUrlPipe,
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

  describe('ngAfterViewInit', () => {
    const nodeResult = PaymentResponseWithStatus(
      PaymentStatusEnum.STATUS_IN_PROCESS,
      'requires_action' as any,
    );
    let updateStatus: jest.SpyInstance;

    beforeEach(() => {
      nodeResult.paymentDetails = {
        verifyUrl: 'verify-url',
      };
      fixture.componentRef.setInput('nodeResult', nodeResult);
      updateStatus = jest.spyOn(component.updateStatus, 'next');
    });

    it('should updateStatus if event data correct', fakeAsync(() => {
      const eventData = {
        data: {
          event: 'StripeCreditCardVerifyCompleted',
        },
      };
      jest.spyOn(rxjs, 'fromEvent').mockReturnValue(rxjs.of(eventData));

      fixture.detectChanges();
      component.ngAfterViewInit();

      expect(updateStatus).toHaveBeenCalled();
    }));

    it('should not call updateStatus if event data incorrect', fakeAsync(() => {
      const eventData = {
        data: {
          event: 'incorrect-event',
        },
      };
      jest.spyOn(rxjs, 'fromEvent').mockReturnValue(rxjs.of(eventData));

      fixture.detectChanges();
      component.ngAfterViewInit();

      expect(updateStatus).not.toHaveBeenCalled();
    }));

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

    it('isBankIframe', () => {
      jest.spyOn(FinishComponent.prototype, 'status', 'get')
        .mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);
      const nodeResult = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        'requires_action' as any,
      );
      nodeResult.paymentDetails = {
        verifyUrl: 'verify-url',
      };
      fixture.componentRef.setInput('nodeResult', nodeResult);
      expect(component.isBankIframe).toEqual(true);
    });
  });
});

