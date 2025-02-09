import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { ExternalRedirectStorage, FlowStorage, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  let store: Store;
  let flowStorage: FlowStorage;
  let nodeFlowService: NodeFlowService;
  let externalRedirectStorage: ExternalRedirectStorage;

  const expectedPaymentProcessStorageKey = `${PaymentMethodEnum.SANTANDER_INSTALLMENT_UK}__payment-processed`;

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
        ExternalRedirectStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    jest.spyOn(store, 'dispatch').mockReturnValue(null);

    flowStorage = TestBed.inject(FlowStorage);
    jest.spyOn(flowStorage, 'getData').mockReturnValue(true);

    nodeFlowService = TestBed.inject(NodeFlowService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();
    delete HTMLFormElement.prototype.submit;

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should tryAgain call showFinishModalFromExistingPayment', () => {

    const showFinishModalFromExistingPaymentSpy = jest.spyOn(component, 'showFinishModalFromExistingPayment');

    component.tryAgain();

    expect(showFinishModalFromExistingPaymentSpy).toHaveBeenCalled();

  });

  it('should showFinishModalFromExistingPayment trigger pollPaymentSubject$', () => {

    const pollPaymentSubjectNext = jest.spyOn(component['pollPaymentSubject$'], 'next');

    component.showFinishModalFromExistingPayment();

    expect(pollPaymentSubjectNext).toHaveBeenCalled();

  });

  it('should paymentProcessStorageKey return correct value', () => {

    expect(component['paymentProcessStorageKey']).toEqual(expectedPaymentProcessStorageKey);

  });

  it('should get isPaymentProcessed on init', () => {

    const getDataSpy = jest.spyOn(flowStorage, 'getData')
      .mockReturnValue(true);

    component.ngOnInit();

    expect(getDataSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, expectedPaymentProcessStorageKey, null);

  });

  it('should call showFinishModalFromExistingPayment if payment processed on init', () => {

    const showFinishModalFromExistingPaymentSpy = jest.spyOn(component, 'showFinishModalFromExistingPayment');

    component.ngOnInit();

    expect(showFinishModalFromExistingPaymentSpy).toHaveBeenCalled();

  });

  it('should update date if payment not processed on init', () => {

    const mockFinalResponse: any = {
      paymentDetails: {
        postParam: 'postParam',
        postUrl: 'postUrl',
        postValue: 'postValue',
      },
    };

    jest.spyOn(flowStorage, 'getData').mockReturnValue(false);

    const mockSubmit = jest.fn();
    window.HTMLFormElement.prototype.submit = mockSubmit;
    const showFinishModalFromExistingPaymentSpy = jest.spyOn(component, 'showFinishModalFromExistingPayment');
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(mockFinalResponse);
    const setDataSpy = jest.spyOn(flowStorage, 'setData');
    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(of(null));

    expect(component.postRedirectData).toBeUndefined();

    component.ngOnInit();

    expect(showFinishModalFromExistingPaymentSpy).not.toHaveBeenCalled();
    expect(getFinalResponseSpy).toHaveBeenCalled();
    expect(component.postRedirectData).toEqual({ ...mockFinalResponse.paymentDetails });
    expect(setDataSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, expectedPaymentProcessStorageKey, true);
    expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
    expect(mockSubmit).toHaveBeenCalled();

  });

  it('should trigger onServiceReady with true on init', () => {

    const onServiceReadyNextSpy = jest.spyOn(component.onServiceReady, 'next');

    component.ngOnInit();

    expect(onServiceReadyNextSpy).toHaveBeenCalledWith(true);

  });

  it('should subscribe on pollPaymentSubject$ on init', () => {

    const pollPaymentSubjectSubscribe = jest.spyOn(component['pollPaymentSubject$'], 'subscribe');

    component.ngOnInit();

    expect(pollPaymentSubjectSubscribe).toHaveBeenCalled();

  });

  it('should pollPaymentSubject$ pipe work correctly', () => {

    const mockPaymentResponse: any = {
      id: 'payment-response-id',
    };

    const pollPaymentUntilStatusSpy = jest.spyOn(nodeFlowService, 'pollPaymentUntilStatus')
      .mockReturnValue(of(null));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(mockPaymentResponse);

    component.ngOnInit();

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

    component.ngOnInit();

    expect(pollPaymentUntilStatusSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toEqual(mockErrorWithMessage.message);

  });

  it('should pollPaymentSubject$ handle error without message', () => {

    const mockErrorWithoutMessage = new Error();

    const pollPaymentUntilStatusSpy = jest.spyOn(nodeFlowService, 'pollPaymentUntilStatus')
      .mockReturnValue(throwError(mockErrorWithoutMessage));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse');

    component.ngOnInit();

    expect(pollPaymentUntilStatusSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toEqual('Unknown error');

  });

});
