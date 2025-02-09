import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { ChooseRateComponent, KitChooseRateComponent, RateUtilsService } from '@pe/checkout/rates';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { LocaleConstantsService } from '@pe/checkout/utils';

import {
  IncomeService,
  RatesCalculationApiService,
  RatesCalculationService,
  DetailsFormService,
  TermsFormService,
  RateEditListComponent,
  DetailsFormComponent,
  TermsFormComponent,
  ProtectionFormComponent,
  PaymentService,
  RateDataInterface,
  IncomeModule,
} from '../../../shared';
import { flowWithPaymentOptionsFixture, localeFixture, paymentOptionFixture } from '../../../test/fixtures';
import { FormComponent } from '../form';

import { RatesContainerComponent } from './rates-container.component';

describe('RatesContainerComponent', () => {
  const storeHelper = new StoreHelper();

  let component: RatesContainerComponent;
  let fixture: ComponentFixture<RatesContainerComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutFormsInputCurrencyModule,
        IncomeModule,
      ],
      declarations: [
        RateEditListComponent,
        DetailsFormComponent,
        TermsFormComponent,
        ProtectionFormComponent,
        ChooseRateComponent,
        KitChooseRateComponent,
        FormComponent,
        RatesContainerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        IncomeService,
        RatesCalculationService,
        RatesCalculationApiService,
        DetailsFormService,
        RateUtilsService,
        TermsFormService,
        PaymentInquiryStorage,
        AddressStorageService,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
        {
          provide: LocaleConstantsService,
          useValue: {
              getLang: jest.fn().mockReturnValue(localeFixture()),
          },
        },
      ],
    }).compileComponents();
    registerLocaleData(de.default);
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: paymentOptionFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(RatesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });


  describe('ngOnInit', () => {
    it('should initialize buttonText and call initPaymentMethod', () => {
      jest.spyOn(component['analyticsFormService'], 'initPaymentMethod');
      const buttonTextSpy = jest.spyOn(component.buttonText, 'next');

      component.ngOnInit();

      expect(component['analyticsFormService'].initPaymentMethod).toHaveBeenCalledWith(component.paymentMethod);
      expect(buttonTextSpy).toHaveBeenCalled();
    });
  });

  describe('triggerSubmit', () => {
    it('should call next on submit$', () => {
      jest.spyOn(component['submit$'], 'next');

      component.triggerSubmit();

      expect(component['submit$'].next).toHaveBeenCalled();
    });
  });

  describe('onSelectRate', () => {
    it('should emit selectRate event and update buttonText for valid rate', () => {
      const mockRate = {
        raw: { monthlyPayment: 100, duration: 12 },
        total: 1200,
        downPayment: 100,
      } as RateDataInterface;
      const emitSpy = jest.spyOn(component.selectRate, 'emit');
      const buttonTextSpy = jest.spyOn(component.buttonText, 'next');

      component.onSelectRate(mockRate);

      expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({
        totalAmount: mockRate.total,
        downPayment: mockRate.downPayment,
      }));
      expect(buttonTextSpy).toHaveBeenCalledWith(expect.stringMatching('100,00'));
    });

    it('should emit selectRate event and update buttonText for valid rate with Comfort Card condition', () => {
      jest.spyOn(component, 'isComfortCardCondition', 'get').mockReturnValue(true);
      const mockRate = {
        raw: { monthlyPayment: 100, duration: 12 },
        total: 1200,
        downPayment: 0,
      } as RateDataInterface;
      const emitSpy = jest.spyOn(component.selectRate, 'emit');
      const buttonTextSpy = jest.spyOn(component.buttonText, 'next');

      component.onSelectRate(mockRate);

      expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({
        totalAmount: mockRate.total,
        downPayment: mockRate.downPayment,
      }));
      expect(buttonTextSpy).toHaveBeenCalledWith(expect.stringContaining('100,00'));
    });

    it('should emit selectRate event and update buttonText for invalid rate', () => {
      const mockRate = null as RateDataInterface;
      const emitSpy = jest.spyOn(component.selectRate, 'emit');

      component.onSelectRate(mockRate);

      expect(emitSpy).toHaveBeenCalledWith(null);
    });
  });

  describe('onRatesLoadingError', () => {
    it('should emit selectRate event and update buttonText for error', () => {
      const isError = true;
      const emitSpy = jest.spyOn(component.selectRate, 'emit');

      component.onRatesLoadingError(isError);

      expect(emitSpy).toHaveBeenCalledWith(null);
    });

    it('should not emit selectRate event or update buttonText for no error', () => {
      const isError = false;
      const emitSpy = jest.spyOn(component.selectRate, 'emit');
      const buttonTextSpy = jest.spyOn(component.buttonText, 'next');

      component.onRatesLoadingError(isError);

      expect(emitSpy).not.toHaveBeenCalled();
      expect(buttonTextSpy).not.toHaveBeenCalled();
    });
  });

  describe('onSubmitted', () => {
    it('should emit continue event', () => {
      const emitSpy = jest.spyOn(component.continue, 'next');

      component.onSubmitted();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('showFinishModalFromExistingPayment', () => {
    it('should emit continue event', () => {
      const emitSpy = jest.spyOn(component.continue, 'next');

      component.showFinishModalFromExistingPayment();

      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
