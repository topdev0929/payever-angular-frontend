import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { FlowStateEnum } from '@pe/checkout/types';
import { prepareData } from '@pe/checkout/utils/prepare-data';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('InquiryContainerComponent', () => {

  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  const mockFormData: any = { data: 'test' };

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [InquiryContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        NodeFlowService,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    nodeFlowService = TestBed.inject(NodeFlowService);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

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

  it('should set button text on init', () => {

    const buttonTextNextSpy = jest.spyOn(component.buttonText, 'next');

    component.ngOnInit();

    expect(buttonTextNextSpy).toHaveBeenCalledWith($localize `:@@payment-sofort.actions.redirect_to_sofort:`);

  });

  it('should emit onServiceReady true on init', () => {

    const onServiceReadyEmitSpy = jest.spyOn(component.onServiceReady, 'emit');

    component.ngOnInit();

    expect(onServiceReadyEmitSpy).toHaveBeenCalledWith(true);

  });

  it('should triggerSubmit call onSend with object', () => {

    const onSendSpy = jest.spyOn(component, 'onSend');

    component.triggerSubmit();

    expect(onSendSpy).toHaveBeenCalledWith({});

  });

  it('should onSend trigger showFinishModalFromExistingPayment', () => {

    component.flow.state = FlowStateEnum.FINISH;
    const showFinishModalFromExistingPaymentSpy = jest.spyOn(component, 'showFinishModalFromExistingPayment');
    const sendPaymentDataSpy = jest.spyOn((component as any), 'sendPaymentData');

    component.onSend(mockFormData);

    expect(showFinishModalFromExistingPaymentSpy).toHaveBeenCalled();
    expect(sendPaymentDataSpy).not.toHaveBeenCalled();

  });

  it('should onSend trigger sendPaymentData', () => {

    component.flow.state = FlowStateEnum.PROGRESS;
    const showFinishModalFromExistingPaymentSpy = jest.spyOn(component, 'showFinishModalFromExistingPayment');
    const sendPaymentDataSpy = jest.spyOn((component as any), 'sendPaymentData');

    component.onSend(mockFormData);

    expect(showFinishModalFromExistingPaymentSpy).not.toHaveBeenCalled();
    expect(sendPaymentDataSpy).toHaveBeenCalledWith(mockFormData);

  });

  it('should isFlowHasFinishedPayment return correct condition', () => {

    expect(component.isFlowHasFinishedPayment()).toEqual(false);

    component.flow.state = FlowStateEnum.PROGRESS;
    expect(component.isFlowHasFinishedPayment()).toEqual(false);

    component.flow.state = FlowStateEnum.CANCEL;
    expect(component.isFlowHasFinishedPayment()).toEqual(true);

    component.flow.state = FlowStateEnum.FINISH;
    expect(component.isFlowHasFinishedPayment()).toEqual(true);

  });

  it('should showFinishModalFromExistingPayment trigger continue', () => {

    const continueNextSpy = jest.spyOn(component.continue, 'next');

    component.showFinishModalFromExistingPayment();

    expect(continueNextSpy).toHaveBeenCalled();

  });

  it('should sendPaymentData set payment details', () => {

    const setPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'setPaymentDetails');
    const continueEmitSpy = jest.spyOn(component.continue, 'emit');

    const preparedFormData = prepareData(mockFormData);

    component['sendPaymentData'](mockFormData);

    expect(setPaymentDetailsSpy).toHaveBeenCalledWith(preparedFormData);
    expect(continueEmitSpy).toHaveBeenCalled();

  });

});
