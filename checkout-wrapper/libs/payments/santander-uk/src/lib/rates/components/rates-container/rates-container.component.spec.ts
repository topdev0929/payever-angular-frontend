import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, ratesFixture, paymentFormFixture } from '../../../test';

import { RatesContainerComponent } from './rates-container.component';

describe('RatesContainerComponent', () => {

  let component: RatesContainerComponent;
  let fixture: ComponentFixture<RatesContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [RatesContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        PaymentInquiryStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_UK]: {
        form: paymentFormFixture(),
      },
    }));
    nodeFlowService = TestBed.inject(NodeFlowService);

    fixture = TestBed.createComponent(RatesContainerComponent);
    component = fixture.componentInstance;

    jest.spyOn(component['currencyPipe'], 'transform').mockReturnValue(null);

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

    expect(buttonTextNextSpy).toHaveBeenCalledWith($localize`:@@payment-santander-uk.actions.pay:`);

  });

  it('should triggerSubmit call next for submit', () => {

    const submitNextSpy = jest.spyOn(component['submit$'], 'next');

    component.triggerSubmit();

    expect(submitNextSpy).toHaveBeenCalled();

  });

  it('should reset rate and update button text on error', () => {

    const selectedRateEmitSpy = jest.spyOn(component.selectRate, 'emit');
    const buttonTextNextSpy = jest.spyOn(component.buttonText, 'next');

    component.onRatesLoadingError(false);

    expect(selectedRateEmitSpy).not.toHaveBeenCalled();
    expect(buttonTextNextSpy).not.toHaveBeenCalled();

    component.onRatesLoadingError(true);

    expect(selectedRateEmitSpy).toHaveBeenCalledWith(null);
    expect(buttonTextNextSpy).toHaveBeenCalledWith($localize`:@@payment-santander-uk.actions.try_again:`);

  });

  it('should call sendPaymentData with formData and trigger continue', () => {

    const sendPaymentDataSpy = jest.spyOn((component as any), 'sendPaymentData');
    const continueNextSpy = jest.spyOn(component.continue, 'next');

    component.onSend(paymentFormFixture());

    expect(sendPaymentDataSpy).toHaveBeenCalledWith(paymentFormFixture());
    expect(continueNextSpy).toHaveBeenCalled();

  });

  it('should sendPaymentData set payment details only nodePaymentDetails', () => {

    const { _deposit_view, ...nodePaymentDetails } = paymentFormFixture();
    const setPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'setPaymentDetails');

    component['sendPaymentData'](paymentFormFixture());

    expect(setPaymentDetailsSpy).toHaveBeenCalledWith(nodePaymentDetails);

  });

  it('should emit select rate null if flow and rate is not defined', () => {

    const selectedRateEmitSpy = jest.spyOn(component.selectRate, 'emit');
    const buttonTextNextSpy = jest.spyOn(component.buttonText, 'next');

    component.onSelectRate(null);

    expect(selectedRateEmitSpy).toHaveBeenCalledWith(null);
    expect(buttonTextNextSpy).toHaveBeenCalledWith($localize`:@@payment-santander-uk.credit_rates.error.rates_list_empty:`);

    component.onSelectRate(ratesFixture()[0]);

    expect(selectedRateEmitSpy).toHaveBeenCalledWith(null);
    expect(buttonTextNextSpy).toHaveBeenCalledWith($localize`:@@payment-santander-uk.credit_rates.error.rates_list_empty:`);

  });

  it('should assignPaymentDetails if flow and rate is defined', () => {

    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');

    component.onSelectRate(ratesFixture()[0]);

    expect(assignPaymentDetailsSpy).toHaveBeenCalledWith({ rate: ratesFixture()[0] });

  });

  it('should update select rate and rate if flow and rate is defined', () => {

    const expectedMonthlyPaymentStr = 'monthlyPaymentStr';
    const expectedDurationStr = $localize`:@@payment-santander-uk.credit_rates.months:`;
    const expectedDuration = `${ratesFixture()[0].duration} ${expectedDurationStr}`;
    const expectedRateInfo: any = {
      chooseText: null,
      totalAmount: ratesFixture()[0].totalCreditCost,
      downPayment: ratesFixture()[0].specificData.downPayment,
    };
    const expectedChooseText = $localize`:@@payment-santander-uk.credit_rates.actions.rate_choose_summary:\
        ${expectedMonthlyPaymentStr}:monthlyPayment:\
        ${expectedDuration}:duration:`;

    const currencyPipeSpy = jest.spyOn(component['currencyPipe'], 'transform')
      .mockReturnValue(expectedMonthlyPaymentStr);
    const selectedRateEmitSpy = jest.spyOn(component.selectRate, 'emit');
    const buttonTextNextSpy = jest.spyOn(component.buttonText, 'next');

    component.onSelectRate(ratesFixture()[0]);

    expect(currencyPipeSpy).toHaveBeenCalledWith(
      ratesFixture()[0].monthlyPayment,
      flowWithPaymentOptionsFixture().currency,
      'symbol',
      );
    expect(selectedRateEmitSpy).toHaveBeenCalledWith(expectedRateInfo);
    expect(buttonTextNextSpy).toHaveBeenCalledWith(expectedChooseText);

  });

});
