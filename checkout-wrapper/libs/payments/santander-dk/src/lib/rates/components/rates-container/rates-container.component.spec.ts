import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { FinanceTypeEnum, PaymentMethodEnum, RateSummaryInterface } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../../test';
import { getPaymentPeriod } from '../../utils';

import { RatesContainerComponent } from './rates-container.component';

jest.mock('../../utils', () => ({
  getPaymentPeriod: jest.fn(),
}));

describe('RatesContainerComponent', () => {

  let component: RatesContainerComponent;
  let fixture: ComponentFixture<RatesContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;
  let trackingService: TrackingService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [RatesContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        TrackingService,
        PaymentInquiryStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    nodeFlowService = TestBed.inject(NodeFlowService);
    trackingService = TestBed.inject(TrackingService);

    fixture = TestBed.createComponent(RatesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  describe('onSelectRate', () => {
    const transformText = 'transform text';
    const rateDefault = ratesFixture()[0];
    const ratePayLater = ratesFixture()[2];

    let assignPaymentDetails: jest.SpyInstance;
    let mockCurrencyPipeTransform: jest.SpyInstance;
    let selectedRateEmit: jest.SpyInstance;
    let buttonTextNext: jest.SpyInstance;
    let helpTextNext: jest.SpyInstance;

    beforeEach(() => {
      assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
        .mockReturnValue(null);
      mockCurrencyPipeTransform = jest.spyOn(component['currencyPipe'], 'transform')
        .mockReturnValue(transformText);
      selectedRateEmit = jest.spyOn(component.selectRate, 'emit');
      buttonTextNext = jest.spyOn(component.buttonText, 'next');
      helpTextNext = jest.spyOn(component.helpText, 'next');
    });

    it('should emit correct values when onSelectRate is called with valid rate', () => {
      store.dispatch(new SetFlow({
        ...flowWithPaymentOptionsFixture(),
        financeType: FinanceTypeEnum.FINANCE_CALCULATOR,
      }));

      const expectedRateSummary: RateSummaryInterface = {
        chooseText: null,
        totalAmount: rateDefault.result.totalLoanAmount,
        downPayment: 0,
      };

      const months = 2;
      (getPaymentPeriod as jest.Mock).mockReturnValue(months);
      const durationStr = $localize`:@@santander-dk.duration.count_months:${months}:count:`;
      const expectedChooseText = $localize`:@@santander-dk.credit_rates.actions.rate_choose_summary_finance_calc:\
          ${transformText}:monthlyCost:\
          ${durationStr}:duration:`;

      component.onSelectRate(rateDefault);
      fixture.detectChanges();

      expect(assignPaymentDetails).toHaveBeenCalledWith({ rate: rateDefault });
      expect(mockCurrencyPipeTransform).toHaveBeenCalledTimes(2);
      expect(selectedRateEmit).toHaveBeenCalledWith(expectedRateSummary);
      expect(buttonTextNext).toHaveBeenCalledWith(expectedChooseText);
      expect(helpTextNext).toHaveBeenCalledWith(null);
    });

    it('should handle translate branch', () => {
      store.dispatch(new SetFlow({
        ...flowWithPaymentOptionsFixture(),
        financeType: FinanceTypeEnum.FINANCE_EXPRESS,
      }));
      const expectedRateSummary: RateSummaryInterface = {
        chooseText: null,
        totalAmount: ratePayLater.result.totalLoanAmount,
        downPayment: 0,
      };

      const months = 1;
      (getPaymentPeriod as jest.Mock).mockReturnValue(months);
      const durationStr = $localize`:@@santander-dk.duration.one_month:${months}:count:`;
      const paymentFreeDurationStr = $localize`:@@santander-dk.duration.one_month:${ratePayLater.result.paymentFreeDuration}:count:`;
      const expectedChooseText = $localize`:@@santander-dk.credit_rates.actions.rate_choose_summary:\
          ${transformText}:monthlyCost:\
          ${durationStr}:duration:`;
      const expectedHelpText = $localize`:@@santander-dk.credit_rates.rate_help_text:\
        ${paymentFreeDurationStr}:payment_free_duration:\
        ${transformText}:establishment_fee:`;

      component.onSelectRate(ratePayLater);
      fixture.detectChanges();

      expect(assignPaymentDetails).toHaveBeenCalledWith({ rate: ratePayLater });
      expect(mockCurrencyPipeTransform).toHaveBeenCalledTimes(2);
      expect(selectedRateEmit).toHaveBeenCalledWith(expectedRateSummary);
      expect(buttonTextNext).toHaveBeenCalledWith(expectedChooseText);
      expect(helpTextNext).toHaveBeenCalledWith(expectedHelpText);
    });

    it('should emit null values when onSelectRate is called with null', () => {
      component.onSelectRate(null);
      fixture.detectChanges();

      expect(selectedRateEmit).toHaveBeenCalledWith(null);
      expect(buttonTextNext).toHaveBeenCalledWith(null);
      expect(helpTextNext).toHaveBeenCalledWith(null);
    });
  });

  it('should successfully pass flow id and paymentMethod after onSubmitted', () => {

    const doEmitRateStepPassedSpy = jest.spyOn(trackingService, 'doEmitRateStepPassed');

    component.onSubmitted(null);

    expect(doEmitRateStepPassedSpy).toHaveBeenCalledWith(
      flowWithPaymentOptionsFixture().id,
      PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
    );

  });

  it('should trigger submit on triggerSubmit', () => {
    const submitNext = jest.spyOn(component['submit$'], 'next');
    component.triggerSubmit();
    expect(submitNext).toHaveBeenCalled();

  });

});
