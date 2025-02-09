import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { prepareData } from '@pe/checkout/utils/prepare-data';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('InquiryContainerComponent', () => {

  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  const mockFormData = {
    test: 'test',
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [InquiryContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    jest.spyOn(store, 'dispatch').mockReturnValue(null);
    nodeFlowService = TestBed.inject(NodeFlowService);

    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should handle input properties', () => {

    component.isSendingPayment = true;

    expect(component.isSendingPayment).toBeTruthy();

  });

  it('should set button text on init', () => {

    const buttonTextNextSpy = jest.spyOn(component.buttonText, 'next');

    component.ngOnInit();

    expect(buttonTextNextSpy).toHaveBeenCalledWith($localize `:@@payment-santander-nl.actions.pay:`);

  });

  it('should onServiceReady emit true on init', () => {

    const onServiceReadyEmitSpy = jest.spyOn(component.onServiceReady, 'emit');

    component.ngOnInit();

    expect(onServiceReadyEmitSpy).toHaveBeenCalledWith(true);

  });

  it('should call onSend on triggerSubmit', () => {

    const onSendSpy = jest.spyOn(component, 'onSend');

    component.triggerSubmit();

    expect(onSendSpy).toHaveBeenCalledWith({});

  });

  it('should send payment data on call onSend', () => {

    const sendPaymentDataSpy = jest.spyOn((component as any), 'sendPaymentData');

    component.onSend(mockFormData);

    fixture.detectChanges();

    expect(sendPaymentDataSpy).toHaveBeenCalledWith(mockFormData);

  });

  it('should set payment details on sendPaymentData call', () => {

    const setPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'setPaymentDetails');
    const continueEmitSpy = jest.spyOn(component.continue, 'emit');

    component['sendPaymentData'](mockFormData);

    expect(setPaymentDetailsSpy).toHaveBeenCalledWith(prepareData(mockFormData));
    expect(continueEmitSpy).toHaveBeenCalled();

  });

});
