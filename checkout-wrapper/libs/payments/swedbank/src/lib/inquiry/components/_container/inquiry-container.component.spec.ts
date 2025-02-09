import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../test';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('InquiryContainerComponent', () => {

  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;
  const analyticsFormService = {
    initPaymentMethod: jest.fn(),
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [InquiryContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
        { provide: AnalyticsFormService, useValue: analyticsFormService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    nodeFlowService = TestBed.inject(NodeFlowService);

    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should pass paymentMethod to initPaymentMethod on init', () => {

    const expectedPaymentMethod = PaymentMethodEnum.SWEDBANK_CREDITCARD;

    const initPaymentMethodSpy = jest.spyOn(analyticsFormService, 'initPaymentMethod');
    jest.spyOn(store, 'selectSnapshot').mockReturnValue(expectedPaymentMethod);

    component.ngOnInit();

    expect(initPaymentMethodSpy).toHaveBeenCalledWith(expectedPaymentMethod);

  });

  it('should trigger buttonText on init', () => {

    const buttonTextNextSpy = jest.spyOn(component.buttonText, 'next');

    component.ngOnInit();

    expect(buttonTextNextSpy).toHaveBeenCalledWith($localize `:@@swedbank.action.next:`);

  });

  it('should emit true to onServiceReady on init', () => {

    const onServiceReadyEmitSpy = jest.spyOn(component.onServiceReady, 'emit');

    component.ngOnInit();

    expect(onServiceReadyEmitSpy).toHaveBeenCalledWith(true);

  });

  it('should triggerSubmit trigger submit', () => {

    const submitNextSpy = jest.spyOn(component['submit$'], 'next');

    component.triggerSubmit();

    expect(submitNextSpy).toHaveBeenCalled();

  });

  it('should onSend send formData to sendPaymentData', () => {

    const sendPaymentDataSpy = jest.spyOn((component as any), 'sendPaymentData');

    component.onSend(paymentFormFixture());

    expect(sendPaymentDataSpy).toHaveBeenCalledWith(paymentFormFixture());

  });

  it('should showFinishModalFromExistingPayment trigger continue', () => {

    const continueNextSpy = jest.spyOn(component.continue, 'next');

    component.showFinishModalFromExistingPayment();

    expect(continueNextSpy).toHaveBeenCalled();

  });

  it('should sendPaymentData correct assign PaymentDetails and send Payment', () => {

    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
      .mockReturnValue(null);
    const setPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'setPaymentDetails')
      .mockReturnValue(null);
    const continueEmitSpy = jest.spyOn(component.continue, 'emit');

    component['sendPaymentData'](paymentFormFixture());

    expect(assignPaymentDetailsSpy)
      .toHaveBeenCalledWith({ address: { phone: paymentFormFixture().detailsForm.phone } });
    expect(setPaymentDetailsSpy).toHaveBeenCalledWith(paymentFormFixture().detailsForm);
    expect(continueEmitSpy).toHaveBeenCalled();

  });

  it('should sendPaymentData assign PaymentDetails handle phone null', () => {

    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
      .mockReturnValue(null);
    const setPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'setPaymentDetails')
      .mockReturnValue(null);
    const continueEmitSpy = jest.spyOn(component.continue, 'emit');

    const mockFormDataWithoutPhone: any = {
      detailsForm: {},
    };

    component['sendPaymentData'](mockFormDataWithoutPhone);

    expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(null);
    expect(setPaymentDetailsSpy).toHaveBeenCalledWith(mockFormDataWithoutPhone.detailsForm);
    expect(continueEmitSpy).toHaveBeenCalled();

  });

});
