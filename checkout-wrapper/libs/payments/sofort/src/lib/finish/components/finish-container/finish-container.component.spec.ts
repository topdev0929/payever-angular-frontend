import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Actions, Store } from '@ngxs/store';
import { of, Subject, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, SetPaymentError, UpdatePayment } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  const actions$ = new Subject();

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FinishContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        NodeFlowService,
        { provide: Actions, useValue: actions$ },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    nodeFlowService = TestBed.inject(NodeFlowService);

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should showFinish$ trigger if UpdatePayment complete', (done) => {

    expect((component as any).topLocationService.isRedirecting).toBeFalsy();

    component.showFinish$.subscribe((condition) => {
      expect(condition).toBe(true);

      done();
    });

    actions$.next({ action: UpdatePayment, status: 'SUCCESSFUL' });

  });

  it('should showFinish$ trigger if SetPaymentError complete', (done) => {

    expect((component as any).topLocationService.isRedirecting).toBeFalsy();

    component.showFinish$.subscribe((condition) => {
      expect(condition).toBe(true);

      done();
    });

    actions$.next({ action: SetPaymentError, status: 'SUCCESSFUL' });

  });

  it('should successfully update paymentResponse', () => {

    const mockPaymentResponse: any = {
      id: 'payment-id',
    };

    const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(of(mockPaymentResponse));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse').
      mockReturnValue(mockPaymentResponse);

    component.showFinishModalFromExistingPayment();

    expect(updatePaymentSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).toHaveBeenCalled();
    expect(component.paymentResponse).toEqual(mockPaymentResponse);
    expect(component.errorMessage).toBeUndefined();

  });

  it('should updatePayment handle error', () => {

    const mockError = new Error('Test Error');

    const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(throwError(mockError));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse');

    component.showFinishModalFromExistingPayment();

    expect(updatePaymentSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.paymentResponse).toBeUndefined();
    expect(component.errorMessage).toEqual(mockError.message);

  });

  it('should updatePayment handle error without message', () => {

    const mockError = new Error();

    const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(throwError(mockError));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse');

    component.showFinishModalFromExistingPayment();

    expect(updatePaymentSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.paymentResponse).toBeUndefined();
    expect(component.errorMessage).toEqual('Unknown error');

  });

});
