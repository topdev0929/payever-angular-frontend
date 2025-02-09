import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, Subject, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  const mockFlow = {
    id: 'flow-id',
    apiCall: {
      cancelUrl: 'cancel-url',
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
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    nodeFlowService = TestBed.inject(NodeFlowService);

    jest.spyOn(store, 'select').mockReturnValue(of(null));
    jest.spyOn(store, 'selectSnapshot').mockReturnValue(mockFlow);

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });


  it('should showFinishModalFromExistingPayment correct update payment details', () => {

    const mockPaymentResponse: any = {
      id: 'payment-response-id',
    };
    const statusSubject$ = new Subject<any>();

    const pollPaymentUntilStatusSpy = jest.spyOn(nodeFlowService, 'pollPaymentUntilStatus')
      .mockReturnValue(statusSubject$.asObservable());
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(mockPaymentResponse);

    component.showFinishModalFromExistingPayment();

    expect(pollPaymentUntilStatusSpy).toHaveBeenCalled();
    expect(component.paymentResponse).toBeNull();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeUndefined();

    statusSubject$.next(null);

    expect(pollPaymentUntilStatusSpy).toHaveBeenCalled();
    expect(component.paymentResponse).toEqual(mockPaymentResponse);
    expect(getFinalResponseSpy).toHaveBeenCalled();
    expect(component.errorMessage).toBeUndefined();

  });

  it('should pollPaymentSubject$ handle error', () => {

    const mockErrorWithMessage = new Error('Error message');

    const pollPaymentUntilStatusSpy = jest.spyOn(nodeFlowService, 'pollPaymentUntilStatus')
      .mockReturnValue(throwError(mockErrorWithMessage));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse');

    component.showFinishModalFromExistingPayment();

    expect(pollPaymentUntilStatusSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toEqual(mockErrorWithMessage.message);

  });

  it('should pollPaymentSubject$ handle error without message', () => {

    const mockErrorWithoutMessage = new Error();

    const pollPaymentUntilStatusSpy = jest.spyOn(nodeFlowService, 'pollPaymentUntilStatus')
      .mockReturnValue(throwError(mockErrorWithoutMessage));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse');

    component.showFinishModalFromExistingPayment();

    expect(pollPaymentUntilStatusSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toEqual('Unknown error');

  });

});
