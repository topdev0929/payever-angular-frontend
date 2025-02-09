import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import { isEmpty } from 'rxjs/operators';

import { DialogService } from '@pe/checkout/dialog';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import {
  ChooseRateComponent,
  KitChooseRateComponent,
  KitRateViewComponent,
  RateUtilsService,
} from '@pe/checkout/rates';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import {
  FinanceTypeEnum,
  PaymentSpecificStatusEnum,
  RateSummaryInterface,
  ResponseErrorsInterface,
} from '@pe/checkout/types';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { FinishComponent } from '../../../shared';
import { PaymentService, RatesCalculationApiService, RatesCalculationService } from '../../../shared/services';
import { RateInterface, RatesFormInterface } from '../../../shared/types';
import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test';
import { RatesEditListComponent } from '../rates-edit-list/rates-edit-list.component';
import { RatesFormComponent } from '../rates-form/rates-form.component';

import { RatesContainerComponent } from './rates-container.component';

describe('RatesContainerComponent', () => {
  const storeHelper = new StoreHelper();
  const httpClientSpy = {
    post: jest.fn().mockReturnValue(new Observable()),
  };

  let component: RatesContainerComponent;
  let fixture: ComponentFixture<RatesContainerComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        HttpClientModule,
      ],
      declarations: [
        ChooseRateComponent,
        KitChooseRateComponent,
        KitRateViewComponent,
        RatesFormComponent,
        RatesEditListComponent,
        MockComponents(FinishComponent),
        RatesContainerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressStorageService,
        PaymentInquiryStorage,
        RatesCalculationApiService,
        RatesCalculationService,
        RateUtilsService,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: DialogService, useValue: {} },
      ],
    }).compileComponents();
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesContainerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeDefined();
    });
  });


  describe('ngOnInit', () => {
    it('should call super.ngOnInit and do some additional initialization', () => {
      jest.spyOn(component, 'isNeedMoreInfo').mockReturnValue(true);
      jest.spyOn(component['trackingService'], 'doEmitPaymentStepReached');

      component.ngOnInit();

      expect(component.nodeResult).toBeNull();
      expect(component['trackingService'].doEmitPaymentStepReached).toHaveBeenCalledWith(
        component.flow.id,
        component.paymentMethod,
        0,
      );
    });
  });

  describe('triggerSubmit', () => {
    it('should trigger submit$', () => {
      jest.spyOn(component['submit$'], 'next');

      component.triggerSubmit();

      expect(component['submit$'].next).toHaveBeenCalled();
    });
  });

  describe('onSelectRate', () => {
    beforeEach(() => {
      jest.spyOn(component['currencyPipe'], 'transform')
        .mockImplementation(value => value.toString());
    });

    it('should emit selectRate and buttonText', () => {
      const rate = {
        campaignCode: '1234',
        monthlyAmount: 1000,
        isFixedAmount: false,
        description: 'desc',
      } as RateInterface;

      const expectedRateInfo: RateSummaryInterface = {
        chooseText: null,
        totalAmount: rate.creditPurchase,
        downPayment: 0,
      };

      jest.spyOn(component.selectRate, 'emit');
      jest.spyOn(component.buttonText, 'next');

      component.onSelectRate(rate);

      expect(component.selectRate.emit).toHaveBeenCalledWith(expectedRateInfo);
      expect(component.buttonText.next).toHaveBeenCalledWith(rate.description);
    });

    it('should emit selectRate and buttonText with isFixedAmount true', () => {
      store.dispatch(new SetFlow({
        ...flowWithPaymentOptionsFixture(),
        financeType: FinanceTypeEnum.FINANCE_CALCULATOR,
      }));
      const rate = {
        campaignCode: '1234',
        monthlyAmount: 1000,
        duration: 2,
        isFixedAmount: true,
        description: 'desc',
      } as RateInterface;
      const durationStr = $localize`:@@santander-no.duration.count_months:${rate.duration}:count:`;
      const chooseText = $localize`:@@santander-no.credit_rates.actions.rate_choose_summary_finance_calc:\
            ${rate.monthlyAmount}:monthly_amount:\
            ${durationStr}:duration:`;

      const expectedRateInfo: RateSummaryInterface = {
        chooseText: null,
        totalAmount: rate.creditPurchase,
        downPayment: 0,
      };

      jest.spyOn(component.selectRate, 'emit');
      jest.spyOn(component.buttonText, 'next');

      component.onSelectRate(rate);

      expect(component.selectRate.emit).toHaveBeenCalledWith(expectedRateInfo);
      expect(component.buttonText.next).toHaveBeenCalledWith(chooseText);
    });
  });

  describe('postPayment', () => {
    const baseHref = 'http://localhost';
    let onRatesLoading: jest.SpyInstance;
    let onPostPaymentSuccess: jest.SpyInstance;

    beforeEach(() => {
      onRatesLoading = jest.spyOn(component.onLoading, 'next');
      onPostPaymentSuccess = jest.spyOn(component as any, 'onPostPaymentSuccess');

      window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          href: baseHref,
        },
        writable: true,
      });
    });

    it('should return EMPTY if isSendingPayment true', (done) => {
      component.isSendingPayment = true;
      component['postPayment']().pipe(isEmpty()).subscribe((res) => {
        expect(res).toEqual(true);
        done();
      });
    });

    it('should redirect to applicantSignReferenceUrl', (done) => {
      const response = PaymentResponseWithStatus(null, PaymentSpecificStatusEnum.STATUS_APPROVED);
      const applicantSignReferenceUrl = 'https://applicantSignReferenceUrl.com';
      const applicantSignReferenceUrlResponse = {
        ...response,
        paymentDetails: {
          applicantSignReferenceUrl,
        },
      };
      jest.spyOn(component['nodeFlowService'], 'postPayment')
        .mockReturnValue(of(applicantSignReferenceUrlResponse));

      component['postPayment']().subscribe(() => {
        expect(component.nodeResult).toEqual(applicantSignReferenceUrlResponse);
        expect(window.location.href).toEqual(applicantSignReferenceUrl);
        done();
      });
    });

    it('should handle if applicantSignReferenceUrl not provided', (done) => {
      const response = PaymentResponseWithStatus(null, null);
      jest.spyOn(component['nodeFlowService'], 'postPayment')
        .mockReturnValue(of(response));

      component['postPayment']().subscribe(() => {
        expect(component.nodeResult).toEqual(response);
        expect(window.location.href).toEqual(baseHref);
        expect(onRatesLoading).toHaveBeenCalled();
        expect(onPostPaymentSuccess).toHaveBeenCalled();
        done();
      });
    });

    it('should handle error', (done) => {
      const responseError: ResponseErrorsInterface = {
        code: 400,
        errors: {
          first: 'invalid',
          second: 'required',
        },
        message: null,
        raw: null,
      };
      jest.spyOn(component['nodeFlowService'], 'postPayment')
        .mockReturnValue(throwError(responseError));

      component['postPayment']().subscribe({
        error: (err) => {
          expect(err).toEqual(responseError);
          expect(component.errors).toEqual(responseError.errors);
          expect(onRatesLoading).toHaveBeenCalledWith(false);
          expect(component.errorMessage).toEqual('invalid, required');
          done();
        },
      });
    });

    it('should handle error if errors is null', (done) => {
      const responseError: ResponseErrorsInterface = {
        code: 400,
        errors: null,
        message: 'Error message',
        raw: null,
      };
      jest.spyOn(component['nodeFlowService'], 'postPayment')
        .mockReturnValue(throwError(responseError));

      component['postPayment']().subscribe({
        error: (err) => {
          expect(err).toEqual(responseError);
          expect(component.errors).toEqual(responseError.errors);
          expect(onRatesLoading).toHaveBeenCalledWith(false);
          expect(component.errorMessage).toEqual(responseError.message);
          done();
        },
      });
    });
  });

  describe('onRatesLoadingError', () => {
    it('should emit null to selectRate and set buttonText to try again on error', () => {
      const selectRateSpy = jest.spyOn(component.selectRate, 'emit');
      const buttonTextSpy = jest.spyOn(component.buttonText, 'next');

      component.onRatesLoadingError(true);

      expect(selectRateSpy).toHaveBeenCalledWith(null);
      expect(buttonTextSpy).toHaveBeenCalledWith($localize`:@@santander-no.action.try_again:`);
    });

    it('should not emit anything on selectRate and buttonText if isError is false', () => {
      const selectRateSpy = jest.spyOn(component.selectRate, 'emit');
      const buttonTextSpy = jest.spyOn(component.buttonText, 'next');

      component.onRatesLoadingError(false);

      expect(selectRateSpy).not.toHaveBeenCalled();
      expect(buttonTextSpy).not.toHaveBeenCalled();
    });
  });

  describe('onSubmitted', () => {
    it('should send payment data and post payment if sendPaymentOnSubmit is true', () => {
      const formData = {} as RatesFormInterface;

      jest.spyOn(component as any, 'sendPaymentData').mockReturnValue(of({}));
      jest.spyOn(component as any, 'postPayment').mockReturnValue(of({}));

      component.sendPaymentOnSubmit = true;

      component.onSubmitted(formData);

      expect(component['sendPaymentData']).toHaveBeenCalledWith(formData);
      expect(component['postPayment']).toHaveBeenCalled();
    });

    it('should emit rate step passed and continue if sendPaymentOnSubmit is false', () => {
      const formData = {} as RatesFormInterface;

      jest.spyOn(component['trackingService'], 'doEmitRateStepPassed');
      jest.spyOn(component.continue, 'next');

      component.sendPaymentOnSubmit = false;

      component.onSubmitted(formData);

      expect(component['trackingService'].doEmitRateStepPassed)
        .toHaveBeenCalledWith(component.flow.id, component.paymentMethod);
      expect(component.continue.next).toHaveBeenCalled();
    });
  });


  describe('sendPaymentData', () => {
    it('should assign payment details and prepare payment', () => {
      const formData = {} as RatesFormInterface;

      jest.spyOn(component['nodeFlowService'], 'assignPaymentDetails').mockReturnValue(of(null));
      jest.spyOn(component as any, 'preparePayment').mockReturnValue(of({}));

      component['sendPaymentData'](formData).subscribe();

      expect(component['nodeFlowService'].assignPaymentDetails).toHaveBeenCalledWith(formData);
      expect(component['preparePayment']).toHaveBeenCalled();
    });
  });

  describe('component', () => {
    it('should isFlowHasPayment return true', () => {
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue({ id: 'response-id' } as any);
      expect(component.flow).not.toBeNull();
      expect(component.isFlowHasPayment()).toBeTruthy();
    });
    it('should isFlowHasPayment return false', () => {
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue(null);
      expect(component.flow).not.toBeNull();
      expect(component.isFlowHasPayment()).toBeFalsy();
    });
    it('should isFlowHasPaymentOrFinished return true if isFlowHasPayment return true', () => {
      jest.spyOn(component, 'isFlowHasPayment').mockReturnValue(true);
      expect(component.isFlowHasPaymentOrFinished()).toBeTruthy();
    });
    it('should isFlowHasPaymentOrFinished return false if isFlowHasPayment return false', () => {
      jest.spyOn(component, 'isFlowHasPayment').mockReturnValue(false);
      expect(component.isFlowHasPaymentOrFinished()).toEqual(false);
    });
    it('should onPostPaymentSuccess trigger next if isNeedMoreInfo', () => {
      jest.spyOn(component, 'isNeedMoreInfo').mockReturnValue(true);
      const next = jest.spyOn(component.continue, 'next');
      component['onPostPaymentSuccess']();
      expect(next).toHaveBeenCalled();
    });
    it('should onPostPaymentSuccess trigger next if isNeedMoreInfo', () => {
      jest.spyOn(component, 'isNeedMoreInfo').mockReturnValue(true);
      const next = jest.spyOn(component.continue, 'next');
      component['onPostPaymentSuccess']();
      expect(next).toHaveBeenCalled();
    });
  });
});
