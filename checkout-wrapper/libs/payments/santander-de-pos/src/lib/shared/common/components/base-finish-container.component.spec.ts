import { Component } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../../test';
import { CommonService, SantanderDePosFlowService } from '../services';

import { BaseFinishContainerComponent } from './base-finish-container.component';



@Component({
  selector: '',
  template: '',
})
class TestComponent extends BaseFinishContainerComponent {
}

describe('BaseFinishContainerComponent', () => {

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let store: Store;
  let commonService: CommonService;
  let santanderDePosFlowService: SantanderDePosFlowService;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        CommonService,
        NodeFlowService,
        SantanderDePosFlowService,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: null },
      ],
      declarations: [
        TestComponent,
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    commonService = TestBed.inject(CommonService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    santanderDePosFlowService = TestBed.inject(SantanderDePosFlowService);


    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should isPaymentUpdateRequired return correct value', () => {

    expect(component.isPaymentUpdateRequired({
      payment: {
        specificStatus: PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
      },
    } as any)).toBeFalsy();

    expect(component.isPaymentUpdateRequired({
      payment: {
        status: PaymentStatusEnum.STATUS_DECLINED,
      },
    } as any)).toBeFalsy();

    expect(component.isPaymentUpdateRequired({
      payment: {
        specificStatus: PaymentSpecificStatusEnum.STATUS_PENDING,
        status: PaymentStatusEnum.STATUS_IN_PROCESS,
      },
    } as any)).toBeTruthy();

  });

  describe('runUpdatePaymentWithTimeout', () => {

    it('should update payment with timeout', fakeAsync(() => {

      const response = PaymentResponseWithStatus(null, PaymentSpecificStatusEnum.STATUS_VERSENDET);

      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(of(response));
      const isPaymentUpdateRequired = jest.spyOn(component, 'isPaymentUpdateRequired')
        .mockReturnValue(false);
      const postPaymentActionSimple = jest.spyOn(santanderDePosFlowService, 'postPaymentActionSimple')
        .mockReturnValue(of(response));
      const manageDocument = jest.spyOn(commonService, 'manageDocument')
        .mockReturnValue(of(null));

      const now = jest.spyOn(Date, 'now').mockReturnValue(0);

      component['runUpdatePaymentWithTimeout']().toPromise();
      tick(15000);
      expect(updatePayment).toHaveBeenCalled();
      expect(isPaymentUpdateRequired).toHaveBeenCalled();
      expect(postPaymentActionSimple).toHaveBeenCalledWith('mark-failed');
      expect(manageDocument).not.toHaveBeenCalledWith(flowWithPaymentOptionsFixture(), response);
      expect(component.paymentResponse).toEqual(response);
      expect(component.isNeedUpdating).toBeFalsy();

      now.mockRestore();
      discardPeriodicTasks();
    }));

    it('should handle if status is not STATUS_VERSENDET', fakeAsync(() => {

      const response = PaymentResponseWithStatus(null, PaymentSpecificStatusEnum.NEED_MORE_INFO);

      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(of(response));
      const isPaymentUpdateRequired = jest.spyOn(component, 'isPaymentUpdateRequired')
        .mockReturnValue(false);
      const postPaymentActionSimple = jest.spyOn(santanderDePosFlowService, 'postPaymentActionSimple')
        .mockReturnValue(of(response));
      const manageDocument = jest.spyOn(commonService, 'manageDocument')
        .mockReturnValue(of(null));

      const now = jest.spyOn(Date, 'now').mockReturnValue(0);

      component['runUpdatePaymentWithTimeout']().toPromise();
      tick(15000);
      expect(updatePayment).toHaveBeenCalled();
      expect(isPaymentUpdateRequired).toHaveBeenCalled();
      expect(postPaymentActionSimple).not.toHaveBeenCalledWith('mark-failed');
      expect(manageDocument).toHaveBeenCalledWith(flowWithPaymentOptionsFixture(), response);

      now.mockRestore();
      discardPeriodicTasks();
    }));

    it('should handle if isPaymentUpdateRequired true', fakeAsync(() => {

      const response = PaymentResponseWithStatus(null, PaymentSpecificStatusEnum.NEED_MORE_INFO);

      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(of(response));
      const isPaymentUpdateRequired = jest.spyOn(component, 'isPaymentUpdateRequired')
        .mockReturnValue(true);
      const postPaymentActionSimple = jest.spyOn(santanderDePosFlowService, 'postPaymentActionSimple')
        .mockReturnValue(of(response));
      const manageDocument = jest.spyOn(commonService, 'manageDocument')
        .mockReturnValue(of(null));

      const now = jest.spyOn(Date, 'now').mockReturnValue(0);

      component['runUpdatePaymentWithTimeout']().toPromise();
      tick(15000);
      expect(updatePayment).toHaveBeenCalled();
      expect(isPaymentUpdateRequired).toHaveBeenCalled();
      expect(postPaymentActionSimple).not.toHaveBeenCalledWith('mark-failed');
      expect(manageDocument).not.toHaveBeenCalledWith(flowWithPaymentOptionsFixture(), response);

      now.mockRestore();
      discardPeriodicTasks();
    }));
  });


});
