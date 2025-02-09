import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { FlowStateEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../../test';
import { IvyChoosePaymentModule } from '../../inquiry.module';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('InquiryContainerComponent', () => {

  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [InquiryContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(IvyChoosePaymentModule),
        PaymentInquiryStorage,
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
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

  it('should handle input properties', () => {

    component.isSendingPayment = true;

    expect(component.isSendingPayment).toBeTruthy();

  });

  it('should set button text on init', () => {

    const buttonTextNextSpy = jest.spyOn(component.buttonText, 'next');

    component.ngOnInit();

    expect(buttonTextNextSpy).toHaveBeenCalledWith($localize `:@@actions.pay:`);

  });

  it('should call onSend on triggerSubmit', () => {

    const onSendSpy = jest.spyOn(component, 'onSend');

    component.triggerSubmit();

    expect(onSendSpy).toHaveBeenCalledWith({});

  });

  it('should isFlowHasFinishedPayment return true', () => {

    component.flow.state = FlowStateEnum.FINISH;

    fixture.detectChanges();

    expect(component.flow.state).toEqual(FlowStateEnum.FINISH);
    expect(component.isFlowHasFinishedPayment()).toBeTruthy();

    component.flow.state = FlowStateEnum.CANCEL;

    fixture.detectChanges();

    expect(component.flow.state).toEqual(FlowStateEnum.CANCEL);
    expect(component.isFlowHasFinishedPayment()).toBeTruthy();


  });

  it('should isFlowHasFinishedPayment return false', () => {

    component.flow.state = FlowStateEnum.PROGRESS;

    fixture.detectChanges();

    expect(component.flow.state).toEqual(FlowStateEnum.PROGRESS);
    expect(component.isFlowHasFinishedPayment()).toBeFalsy();

  });

  it('should call showFinishModalFromExistingPayment if flow has finished payment', () => {

    const isFlowHasFinishedPaymentSpy = jest.spyOn(component, 'isFlowHasFinishedPayment').mockReturnValue(true);
    const showFinishModalFromExistingPaymentSpy = jest.spyOn(component, 'showFinishModalFromExistingPayment');
    const continueNextSpy = jest.spyOn(component.continue, 'next');
    const sendPaymentDataSpy = jest.spyOn((component as any), 'sendPaymentData');

    component.onSend({});

    fixture.detectChanges();

    expect(isFlowHasFinishedPaymentSpy).toHaveBeenCalled();
    expect(showFinishModalFromExistingPaymentSpy).toHaveBeenCalled();
    expect(continueNextSpy).toHaveBeenCalled();
    expect(sendPaymentDataSpy).not.toHaveBeenCalled();

  });

  it('should call sendPaymentData if flow has not finished payment', () => {

    const mockFormData = {
      test: 'test',
    };

    const isFlowHasFinishedPaymentSpy = jest.spyOn(component, 'isFlowHasFinishedPayment').mockReturnValue(false);
    const showFinishModalFromExistingPaymentSpy = jest.spyOn(component, 'showFinishModalFromExistingPayment');
    const continueNextSpy = jest.spyOn(component.continue, 'next');
    const sendPaymentDataSpy = jest.spyOn((component as any), 'sendPaymentData');

    component.onSend(mockFormData);

    fixture.detectChanges();

    expect(isFlowHasFinishedPaymentSpy).toHaveBeenCalled();
    expect(showFinishModalFromExistingPaymentSpy).not.toHaveBeenCalled();
    expect(continueNextSpy).not.toHaveBeenCalled();
    expect(sendPaymentDataSpy).toHaveBeenCalledWith(mockFormData);

  });

});
