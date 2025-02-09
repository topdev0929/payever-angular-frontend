import { HttpEventType, HttpHeaders } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApmService } from '@elastic/apm-rum-angular';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum, PaymentStatusEnum, ResponseErrorsInterface } from '@pe/checkout/types';
import { POLLING_CONFIG } from '@pe/checkout/utils/poll';

import { DK_POLLING_CONFIG } from '../../../settings';
import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  const paymentStateResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
  const apmService = {
    apm: {
      setCustomContext: jest.fn(),
      captureError: jest.fn(),
    },
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FinishContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        PaymentInquiryStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
        { provide: POLLING_CONFIG, useValue: DK_POLLING_CONFIG },
        { provide: ApmService, useValue: apmService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          response: paymentStateResponse,
        },
      },
    }));
    nodeFlowService = TestBed.inject(NodeFlowService);

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should call runStatusCheck after paymentCallback', (done) => {

    const runStatusCheckSpy = jest.spyOn(component as any, 'runStatusCheck')
      .mockReturnValue(of(null));

    component['paymentCallback']().subscribe(() => {
      expect(runStatusCheckSpy).toHaveBeenCalled();

      done();
    });

  });

  it('should set isCheckStatusProcessing to true when runStatusCheck is called', () => {

    component['runStatusCheck']();

    expect(component.isCheckStatusProcessing).toEqual(true);

  });

  it('should call nodeApiService.updatePayment when runStatusCheck is called', () => {

    const nodeApiServiceSpy = jest.spyOn(nodeFlowService, 'updatePayment');

    component['runStatusCheck']();

    expect(nodeApiServiceSpy).toHaveBeenCalled();

  });

  it('should update payment status and handle processing state', fakeAsync(() => {

    const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(of(paymentStateResponse));

    component['runStatusCheck']().subscribe();

    tick(component['pollingConfig'].maxTimeout);

    expect(component.isCheckStatusProcessing).toBeFalsy();
    expect(component.isCheckStatusTimeout).toBeFalsy();
    expect(updatePayment).toHaveBeenCalled();
    expect(component.paymentResponse).toEqual(paymentStateResponse);

    discardPeriodicTasks();
    flush();

  }));

  it('should runStatusCheck handle maxTimeout', fakeAsync(() => {

    const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(of(paymentStateResponse));
    jest.spyOn(component as any, 'checkIsCheckStatusProcessing').mockReturnValue(true);

    component['runStatusCheck']().subscribe();

    tick(component['pollingConfig'].maxTimeout);

    expect(component.isCheckStatusProcessing).toBeTruthy();
    expect(component.isCheckStatusProcessing).toBeTruthy();
    expect(updatePayment).toHaveBeenCalled();
    expect(component.paymentResponse).toEqual(paymentStateResponse);

    discardPeriodicTasks();
    flush();

  }));

  it('should handle error scenarios in runStatusCheck', fakeAsync(() => {

    const mockPaymentStateError: ResponseErrorsInterface = {
      code: 200,
      errors: { someError: 'error' },
      message: 'all ok',
      raw: {
        name: 'HttpErrorResponse',
        message: '',
        error: undefined,
        ok: false,
        headers: new HttpHeaders,
        status: 0,
        statusText: '',
        url: '',
        type: HttpEventType.ResponseHeader,
      },
    };

    jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(throwError(mockPaymentStateError));

    component['runStatusCheck']().subscribe({
      error: () => {
        expect(component.errors).toEqual(mockPaymentStateError.errors);
        expect(component.errorMessage).toEqual(mockPaymentStateError.message);

        expect(component.isCheckStatusProcessing).toBeFalsy();
        expect(component.isCheckStatusTimeout).toBeFalsy();
      },
    });

    tick(component['pollingConfig'].maxTimeout);

    expect(component.isCheckStatusProcessing).toBeFalsy();
    expect(component.errorMessage).toEqual(mockPaymentStateError.message);

    discardPeriodicTasks();
    flush();

  }));

});
