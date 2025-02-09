import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { of, throwError } from 'rxjs';

import { TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { FinanceTypeEnum, PaymentMethodEnum, SalesScoringType } from '@pe/checkout/types';

import {
  FormInterface,
  RateInterface,
  SantanderSeApiService,
  SantanderSeFlowService,
} from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';

import { RatesContainerComponent } from './rates-container.component';


const rate: RateInterface = {
  annualFee: 0,
  baseInterestRate: 0,
  billingFee: 0,
  code: '3006',
  effectiveInterest: 5.3,
  monthlyCost: 2167,
  months: 6,
  payLaterType: false,
  startupFee: 195,
  totalCost: 13195,
};

describe('santander-se-rates-container', () => {
  let component: RatesContainerComponent;
  let fixture: ComponentFixture<RatesContainerComponent>;

  let store: Store;
  let santanderSeFlowService: SantanderSeFlowService;
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
        PaymentInquiryStorage,
        AddressStorageService,
        SantanderSeFlowService,
        SantanderSeApiService,
        TrackingService,
        NodeFlowService,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useValue: {},
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    santanderSeFlowService = TestBed.inject(SantanderSeFlowService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    trackingService = TestBed.inject(TrackingService);

    fixture = TestBed.createComponent(RatesContainerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  describe('Constructor', () => {
    it('Should define component', () => {
      expect(component).toBeDefined();
    });
  });

  describe('component', () => {

    it('should load icons on create', () => {
      const mockLoadIcons = jest.fn();
      (window as any).PayeverStatic = {
        SvgIconsLoader: {
          loadIcons: mockLoadIcons,
        },
      };
      component.ngOnInit();
      expect(mockLoadIcons).toHaveBeenCalledWith(['bankid'], null, component['customElementService'].shadowRoot);
    });

    it('should trigger submit on triggerSubmit', () => {
      const submit = jest.spyOn(component['submit$'], 'next');
      component.triggerSubmit();

      expect(submit).toHaveBeenCalled();
    });

    it('should retryAuthentication perform correctly', () => {
      const submit = jest.spyOn(component['submit$'], 'next');
      const showFinishWrapperSubject = jest.spyOn(component['showFinishWrapperSubject$'], 'next');
      component.retryAuthentication();

      expect(showFinishWrapperSubject).toHaveBeenCalledWith(null);
      expect(submit).toHaveBeenCalled();
    });

    it('should formatSSN perform correctly', () => {

      expect(component['formatSSN']('12asdasd-2131r')).toEqual('122131');
      expect(component['formatSSN']('')).toEqual('');
      expect(component['formatSSN']('12345678910')).toEqual('12345678910');

    });

    it('should correct get ssn details', (done) => {

      const ssn = '12345678910';
      const totalAmount = 1000;
      const ssnDetails = {
        inquiryId: 'inquiry-id',
        socialSecurityNumber: ssn,
        name: 'TestName TestSurname',
        address: '12 Address Test, Test, 12323',
        city: 'Test',
        zipCode: '12323',
        hasOpenApplications: true,
        salesScoringType: SalesScoringType.Authorization,
      };

      component.totalAmount = totalAmount;
      const getSSNDetailsOnce = jest.spyOn(santanderSeFlowService, 'getSSNDetailsOnce')
        .mockReturnValue(of(ssnDetails));
      const extendAddressIfNotFilled = jest.spyOn(santanderSeFlowService, 'extendAddressIfNotFilled')
        .mockReturnValue(null);


      component['getSSNDetails'](ssn).subscribe((res) => {
        expect(res).toEqual(ssnDetails.inquiryId);
        expect(getSSNDetailsOnce).toHaveBeenCalledWith(ssn, totalAmount);
        expect(extendAddressIfNotFilled).toHaveBeenCalledWith({
          firstName: ssnDetails.name.split(' ')[0],
          lastName: ssnDetails.name.split(' ').slice(1).join(' '),
          city: ssnDetails.city,
          street: ssnDetails.address,
          streetName: ssnDetails.address,
          zipCode: ssnDetails.zipCode,
        });

        done();
      });

    });

    it('should initiate authentication', (done) => {

      const ssn = '12345678910';
      const response = { id: 'test' };
      const initiateAuthentication = jest.spyOn(santanderSeFlowService, 'initiateAuthentication')
        .mockReturnValue(of(response));

      component['initiateAuthentication'](ssn).subscribe((res) => {
        expect(res).toEqual(response);
        expect(initiateAuthentication).toHaveBeenCalledWith(ssn);

        done();
      });

    });

    it('should handle onRatesLoadingError', () => {

      const selectRateEmit = jest.spyOn(component.selectRate, 'emit');
      const buttonTextNext = jest.spyOn(component.buttonText, 'next');

      component.onRatesLoadingError(false);

      expect(selectRateEmit).not.toHaveBeenCalledWith(null);
      expect(buttonTextNext).not.toHaveBeenCalledWith($localize`:@@santander-se.action.try_again:`);

      component.onRatesLoadingError(true);

      expect(selectRateEmit).toHaveBeenCalledWith(null);
      expect(buttonTextNext).toHaveBeenCalledWith($localize`:@@santander-se.action.try_again:`);

    });

    it('should emit tracking service on init', () => {

      const doEmitPaymentStepReached = jest.spyOn(trackingService, 'doEmitPaymentStepReached');

      component.ngOnInit();

      expect(doEmitPaymentStepReached).toHaveBeenCalledWith(
        flowWithPaymentOptionsFixture().id,
        PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
        0,
      );

    });

    it('should update total on init', () => {

      component.ngOnInit();

      expect(component.totalAmount).toEqual(flowWithPaymentOptionsFixture().total);

    });

    describe('onSelectRate', () => {
      it('should select rate correctly', () => {
        store.dispatch(new SetFlow({
          ...flowWithPaymentOptionsFixture(),
          financeType: FinanceTypeEnum.FINANCE_CALCULATOR,
        }));
        fixture.destroy();
        fixture = TestBed.createComponent(RatesContainerComponent);
        component = fixture.componentInstance;

        const expectedRateInfo: any = {
          chooseText: null,
          totalAmount: rate.totalCost,
          downPayment: 0,
        };
        const durationStr = $localize`:@@santander-se.credit_rates.months:`;
        const expectedDurations = `${rate.months} ${durationStr}`;
        const monthlyCostStr = 'transformed-value';

        const currencyPipeTransform = jest.spyOn(component['currencyPipe'], 'transform')
          .mockReturnValue(monthlyCostStr);
        const assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
        const buttonTextNext = jest.spyOn(component.buttonText, 'next');
        const selectRateEmit = jest.spyOn(component.selectRate, 'emit');

        component.onSelectRate(rate);

        expect(component.flow).not.toBeNull();
        expect(currencyPipeTransform)
          .toHaveBeenCalledWith(rate.monthlyCost, flowWithPaymentOptionsFixture().currency, 'symbol-narrow');
        expect(assignPaymentDetails).toHaveBeenCalledWith({ rate });
        expect(selectRateEmit).toHaveBeenCalledWith(expectedRateInfo);
        expect(buttonTextNext).toHaveBeenCalledWith($localize`:@@santander-se.credit_rates.actions.rate_choose_summary_finance_calc:${monthlyCostStr}:totalCost:${expectedDurations}:duration:`);

      });

      it('should select rate correctly with branch text', () => {

        store.dispatch(new SetFlow({
          ...flowWithPaymentOptionsFixture(),
          financeType: FinanceTypeEnum.FINANCE_EXPRESS,
        }));
        fixture.destroy();
        fixture = TestBed.createComponent(RatesContainerComponent);
        component = fixture.componentInstance;

        const rateOneMonth = {
          ...rate,
          months: 1,
        };

        const expectedRateInfo: any = {
          chooseText: null,
          totalAmount: rate.totalCost,
          downPayment: 0,
        };
        const durationStr = $localize`:@@santander-se.credit_rates.month:`;
        const expectedDuration = `${rateOneMonth.months} ${durationStr}`;
        const monthlyCostStr = 'transformed-value';

        const currencyPipeTransform = jest.spyOn(component['currencyPipe'], 'transform')
          .mockReturnValue(monthlyCostStr);
        const assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
        const buttonTextNext = jest.spyOn(component.buttonText, 'next');
        const selectRateEmit = jest.spyOn(component.selectRate, 'emit');

        component.onSelectRate(rateOneMonth);

        expect(component.flow).not.toBeNull();
        expect(currencyPipeTransform)
          .toHaveBeenCalledWith(rateOneMonth.monthlyCost, flowWithPaymentOptionsFixture().currency, 'symbol-narrow');
        expect(assignPaymentDetails).toHaveBeenCalledWith({ rate: rateOneMonth });
        expect(selectRateEmit).toHaveBeenCalledWith(expectedRateInfo);
        expect(buttonTextNext).toHaveBeenCalledWith($localize`:@@santander-se.credit_rates.actions.rate_choose_summary:${monthlyCostStr}:monthlyCost:${expectedDuration}:duration:`);

      });

      it('should select rate correctly with payLater branch text', () => {

        store.dispatch(new SetFlow({
          ...flowWithPaymentOptionsFixture(),
          financeType: FinanceTypeEnum.FINANCE_EXPRESS,
        }));
        fixture.destroy();
        fixture = TestBed.createComponent(RatesContainerComponent);
        component = fixture.componentInstance;

        const ratePayLayer = {
          ...rate,
          payLaterType: true,
        };

        const expectedRateInfo: any = {
          chooseText: null,
          totalAmount: rate.totalCost,
          downPayment: 0,
        };
        const transformValue = 'transformed-value';

        const currencyPipeTransform = jest.spyOn(component['currencyPipe'], 'transform')
          .mockReturnValue(transformValue);
        const assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
        const buttonTextNext = jest.spyOn(component.buttonText, 'next');
        const selectRateEmit = jest.spyOn(component.selectRate, 'emit');
        const moment = dayjs().add(rate.months, 'months');
        const month: string = moment.locale(component['localeConstantsService'].getLang()).format('MMMM').toLowerCase();

        component.onSelectRate(ratePayLayer);

        expect(component.flow).not.toBeNull();
        expect(currencyPipeTransform)
          .toHaveBeenCalledWith(ratePayLayer.monthlyCost, flowWithPaymentOptionsFixture().currency, 'symbol-narrow');
        expect(assignPaymentDetails).toHaveBeenCalledWith({ rate: ratePayLayer });
        expect(selectRateEmit).toHaveBeenCalledWith(expectedRateInfo);
        expect(buttonTextNext).toHaveBeenCalledWith($localize`:@@santander-se.credit_rates.rate_title_bnpl:\
          ${transformValue}:totalCost:\
          ${month}:monthName:`);

      });
    });


    it('should handle not found rate', () => {

      const buttonTextNext = jest.spyOn(component.buttonText, 'next');
      const selectRateEmit = jest.spyOn(component.selectRate, 'emit');

      component.onSelectRate(null);

      expect(selectRateEmit).toHaveBeenCalledWith(null);
      expect(buttonTextNext).toHaveBeenCalled();

    });

    it('should onSubmitted perform correctly', fakeAsync(() => {

      const formData = {
        ssnForm: {
          socialSecurityNumber: '12345678910',
        },
      } as FormInterface;
      const inquiryId = 'inquiry-id';
      const response = {
        salesScoringType: SalesScoringType.Authorization,
      };
      component.formElem = {
        setInquiryId: jest.fn(),
        setSalesScoringType: jest.fn(),
      } as any;

      const showFinishWrapperSubjectNext = jest.spyOn(component['showFinishWrapperSubject$'], 'next');
      const initiateAuthentication = jest.spyOn(component as any, 'initiateAuthentication')
        .mockReturnValue(of(null));
      const getSSNDetails = jest.spyOn(component as any, 'getSSNDetails')
        .mockReturnValue(of(inquiryId));
      const setInquiryId = jest.spyOn(component.formElem, 'setInquiryId');
      const getApplication = jest.spyOn(santanderSeFlowService, 'getApplication')
        .mockReturnValue(of(response));
      const setSalesScoringType = jest.spyOn(component.formElem, 'setSalesScoringType')
        .mockReturnValue(null);
      component.onSubmitted(formData);
      tick();
      expect(showFinishWrapperSubjectNext).toHaveBeenCalledWith({
        title: $localize`:@@santander-se.inquiry.finish.ssn_processing.title:`,
        text: $localize`:@@santander-se.inquiry.finish.ssn_processing.text:`,
        error: false,
      });
      expect(initiateAuthentication).toHaveBeenCalledWith(formData.ssnForm.socialSecurityNumber);
      expect(getSSNDetails).toHaveBeenCalledWith(formData.ssnForm.socialSecurityNumber);
      expect(setInquiryId).toHaveBeenCalledWith(inquiryId);
      expect(getApplication).toHaveBeenCalledWith(inquiryId, false);
      expect(setSalesScoringType).toHaveBeenCalledWith(response.salesScoringType);
    }));


    it('should onSubmitted handle initiateAuthentication error', (done) => {
      const formData = {
        ssnForm: {
          socialSecurityNumber: '12345678910',
        },
      } as FormInterface;
      component.formElem = {
        setInquiryId: jest.fn(),
        setSalesScoringType: jest.fn(),
      } as any;
      const showFinishWrapperSubjectNext = jest.spyOn(component['showFinishWrapperSubject$'], 'next');
      const initiateAuthentication = jest.spyOn(component as any, 'initiateAuthentication')
        .mockReturnValue(throwError(new Error('test')));
      const getSSNDetails = jest.spyOn(component as any, 'getSSNDetails');
      const setInquiryId = jest.spyOn(component.formElem, 'setInquiryId');
      const getApplication = jest.spyOn(santanderSeFlowService, 'getApplication');
      const setSalesScoringType = jest.spyOn(component.formElem, 'setSalesScoringType');

      component.onSubmitted(formData);
      expect(showFinishWrapperSubjectNext).toHaveBeenNthCalledWith(1, {
        title: $localize`:@@santander-se.inquiry.finish.ssn_processing.title:`,
        text: $localize`:@@santander-se.inquiry.finish.ssn_processing.text:`,
        error: false,
      });
      expect(initiateAuthentication).toHaveBeenCalledWith(formData.ssnForm.socialSecurityNumber);
      component['initiateAuthentication'](formData.ssnForm.socialSecurityNumber).subscribe({
        error: () => {
          expect(showFinishWrapperSubjectNext).toHaveBeenNthCalledWith(2, {
            title: $localize`:@@santander-se.inquiry.finish.ssn_processing.title:`,
            text: $localize`:@@santander-se.inquiry.finish.ssn_processing.text:`,
            error: true,
          });
          expect(getSSNDetails).not.toHaveBeenCalled();
          expect(setInquiryId).not.toHaveBeenCalled();
          expect(getApplication).not.toHaveBeenCalled();
          expect(setSalesScoringType).not.toHaveBeenCalled();

          done();
        },
      });
    });

    it('should onSubmitted handle getSSNDetails error', (done) => {
      const formData = {
        ssnForm: {
          socialSecurityNumber: '12345678910',
        },
      } as FormInterface;
      component.formElem = {
        setInquiryId: jest.fn(),
        setSalesScoringType: jest.fn(),
      } as any;
      const showFinishWrapperSubjectNext = jest.spyOn(component['showFinishWrapperSubject$'], 'next');
      const initiateAuthentication = jest.spyOn(component as any, 'initiateAuthentication')
        .mockReturnValue(of(null));
      const getSSNDetails = jest.spyOn(component as any, 'getSSNDetails')
        .mockReturnValue(throwError(new Error('test')));
      const setInquiryId = jest.spyOn(component.formElem, 'setInquiryId');
      const getApplication = jest.spyOn(santanderSeFlowService, 'getApplication');
      const setSalesScoringType = jest.spyOn(component.formElem, 'setSalesScoringType');

      component.onSubmitted(formData);
      expect(showFinishWrapperSubjectNext).toHaveBeenNthCalledWith(1, {
        title: $localize`:@@santander-se.inquiry.finish.ssn_processing.title:`,
        text: $localize`:@@santander-se.inquiry.finish.ssn_processing.text:`,
        error: false,
      });
      expect(initiateAuthentication).toHaveBeenCalledWith(formData.ssnForm.socialSecurityNumber);
      component['initiateAuthentication'](formData.ssnForm.socialSecurityNumber).subscribe({
        next: () => {
          expect(getSSNDetails).toHaveBeenCalled();
          expect(component.errors).toEqual({ socialSecurityNumber: 'test' });
          expect(setInquiryId).not.toHaveBeenCalled();
          expect(getApplication).not.toHaveBeenCalled();
          expect(setSalesScoringType).not.toHaveBeenCalled();

          done();
        },
      });
    });

    it('should onSubmitted handle getSSNDetails empty error message', (done) => {
      const formData = {
        ssnForm: {
          socialSecurityNumber: '12345678910',
        },
      } as FormInterface;
      component.formElem = {
        setInquiryId: jest.fn(),
        setSalesScoringType: jest.fn(),
      } as any;
      const showFinishWrapperSubjectNext = jest.spyOn(component['showFinishWrapperSubject$'], 'next');
      const initiateAuthentication = jest.spyOn(component as any, 'initiateAuthentication')
        .mockReturnValue(of(null));
      const getSSNDetails = jest.spyOn(component as any, 'getSSNDetails')
        .mockReturnValue(throwError(new Error()));
      const setInquiryId = jest.spyOn(component.formElem, 'setInquiryId');
      const getApplication = jest.spyOn(santanderSeFlowService, 'getApplication');
      const setSalesScoringType = jest.spyOn(component.formElem, 'setSalesScoringType');

      component.onSubmitted(formData);
      expect(showFinishWrapperSubjectNext).toHaveBeenNthCalledWith(1, {
        title: $localize`:@@santander-se.inquiry.finish.ssn_processing.title:`,
        text: $localize`:@@santander-se.inquiry.finish.ssn_processing.text:`,
        error: false,
      });
      expect(initiateAuthentication).toHaveBeenCalledWith(formData.ssnForm.socialSecurityNumber);
      component['initiateAuthentication'](formData.ssnForm.socialSecurityNumber).subscribe({
        next: () => {
          expect(getSSNDetails).toHaveBeenCalled();
          expect(component.errors).toEqual({ socialSecurityNumber: 'Cant get SSN data' });
          expect(setInquiryId).not.toHaveBeenCalled();
          expect(getApplication).not.toHaveBeenCalled();
          expect(setSalesScoringType).not.toHaveBeenCalled();

          done();
        },
      });
    });

    describe('finishWrapperButtons$', () => {
      it('should finishWrapperButtons$ return null', (done) => {
        component.finishWrapperButtons$.subscribe((value) => {
          expect(value).toBeNull();
          done();
        });
        component['showFinishWrapperSubject$'].next({ error: null });
      });

      it('should finishWrapperButtons$ return correct value', (done) => {
        const retryAuthentication = jest.spyOn(component, 'retryAuthentication');
        component.finishWrapperButtons$.subscribe((value) => {
          expect(value).toMatchObject({
            retry: {
              title: $localize`:@@santander-se.action.try_again:`,
              classes: 'btn btn-primary btn-link',
            },
          });
          value.retry.click();
          expect(retryAuthentication).toHaveBeenCalled();
          done();
        });
        component['showFinishWrapperSubject$'].next({ error: 'some-error' });
      });
    });

  });

});
