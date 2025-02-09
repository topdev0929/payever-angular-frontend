import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { Subject, of } from 'rxjs';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { ChooseRateComponent, KitChooseRateComponent, RateUtilsService } from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, PatchFormState, PaymentState, SetPayments } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import {
  IncomeService,
  RatesCalculationApiService,
  RatesCalculationService,
  DetailsFormService,
  TermsFormService,
  SelectedInterface,
  RateEditListComponent,
  DetailsFormComponent,
  TermsFormComponent,
  ProtectionFormComponent, PersonTypeEnum,
} from '../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture, paymentOptionFixture } from '../../../test/fixtures';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let store: Store;

  const cpiTariffSubject = new Subject<number>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutFormsInputCurrencyModule,
      ],
      declarations: [
        RateEditListComponent,
        DetailsFormComponent,
        TermsFormComponent,
        ProtectionFormComponent,
        ChooseRateComponent,
        KitChooseRateComponent,
        FormComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationService,
        RatesCalculationApiService,
        DetailsFormService,
        RateUtilsService,
        PaymentInquiryStorage,
        TermsFormService,
        {
          provide: IncomeService,
          useValue: {
            cpiTariff$: cpiTariffSubject,
          },
        },
      ],
    });
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

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });


  describe('submitted', () => {
    it('should call onSubmit on formGroupDirective and emit formGroup value if form is valid', (done) => {
      const onSubmitSpy = jest.spyOn(component['formGroupDirective'], 'onSubmit');
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);

      component.submitted.subscribe((value) => {
        expect(onSubmitSpy).toHaveBeenCalledWith(null);
        expect(value).toEqual(component.formGroup.value);
        done();
      });

      component['submit$'].next();
    });

    it('should not call onSubmit or emit if form is invalid', fakeAsync(() => {
      const onSubmitSpy = jest.spyOn(component['formGroupDirective'], 'onSubmit');
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(false);

      component.submitted.subscribe();
      tick();

      expect(onSubmitSpy).not.toHaveBeenCalled();
    }));
  });

  describe('ngOnInit', () => {
    it('should disable protectionForm if merchantMode is false', () => {
      jest.spyOn(component.formGroup.get('protectionForm'), 'disable');

      component.ngOnInit();

      expect(component.formGroup.get('protectionForm').disable).toHaveBeenCalled();
    });

    it('should enable protectionForm if merchantMode is true', () => {
      jest.spyOn(component.formGroup.get('protectionForm'), 'enable');
      jest.spyOn(component as any, 'merchantMode', 'get').mockReturnValue(true);
      component.ngOnInit();
      expect(component.formGroup.get('protectionForm').enable).toHaveBeenCalled();
    });

    it('should handle cpiTariff$', () => {
      jest.spyOn(store, 'select').mockReturnValue(of(paymentFormFixture().customer));
      fixture.destroy();
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
      jest.spyOn(component as any, 'merchantMode', 'get').mockReturnValue(true);
      cpiTariffSubject.next(100);

      expect(component.formGroup.get('protectionForm').value).toMatchObject({
        _yes: paymentFormFixture()[PersonTypeEnum.Customer].protectionForm._yes,
        dataForwardingRsv: paymentFormFixture()[PersonTypeEnum.Customer].protectionForm.dataForwardingRsv,
        _no: paymentFormFixture()[PersonTypeEnum.Customer].protectionForm._no,
      });
      expect(component.formGroup.get('protectionForm').enabled).toBeTruthy();
    });

    it('should handle cpiTariff null', () => {
      const patchValue = jest.spyOn(component.formGroup, 'patchValue');
      jest.spyOn(component as any, 'merchantMode', 'get').mockReturnValue(true);
      store.dispatch(new PatchFormState(paymentFormFixture()));
      component.ngOnInit();
      cpiTariffSubject.next(null);
      expect(component.formGroup.get('protectionForm').disabled).toBeTruthy();
      expect(patchValue).toBeCalledWith({
        protectionForm: { _yes: false, _no: true },
      });
    });

    it('should cpiTariff$ filter work corretly', () => {
      jest.spyOn(component as any, 'merchantMode', 'get').mockReturnValue(true);
      const patchValue = jest.spyOn(component.formGroup, 'patchValue');
      jest.spyOn(component as any, 'patchForm').mockReturnValue(null);
      component.ngOnInit();
      expect(patchValue).toHaveBeenCalledTimes(0);
      cpiTariffSubject.next(100);
      cpiTariffSubject.next(100);
      cpiTariffSubject.next(100);
      cpiTariffSubject.next(200);
      cpiTariffSubject.next(500);
      cpiTariffSubject.next(null);

      expect(patchValue).toBeCalledTimes(2);
    });

    it('should subscribe to formGroup valueChanges and dispatch PatchFormState', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch').mockImplementation(jest.fn());
      const mockFormValue = { ratesForm: {}, detailsForm: {}, termsForm: {}, protectionForm: {} };

      component.ngOnInit();

      component.formGroup.setValue(mockFormValue);

      expect(dispatchSpy).toHaveBeenCalledWith({
        form: {
          customer: {},
          detailsForm: {
            _downPayment_view: null,
            _enableDesiredInstalment: true,
            condition: 'key',
            dayOfFirstInstalment: 15,
            downPayment: null,
          },
          ratesForm: {
            _rate: null,
            creditDurationInMonths: null,
          },
          termsForm: {
            _agreeToBeAdvised: undefined,
            customerConditionsAccepted: undefined,
          },
        },
      });
    });
  });

  describe('onRateSelected', () => {
    it('should emit rateSelected event with the correct data', () => {
      const emitSpy = jest.spyOn(component.rateSelected, 'emit');
      const mockSelected = {
        rate: {
          totalCreditCost: 100,
        },
        data: {
          creditDurationInMonths: 200,
        },
      } as SelectedInterface;
      component.formGroup.get('detailsForm').patchValue({
        downPayment: 50,
      });

      component.onRateSelected(mockSelected);

      expect(component.selectedRate).toEqual(mockSelected.rate);
      expect(emitSpy).toHaveBeenCalledWith({ downPayment: 50, raw: mockSelected.rate, total: 150 });
    });
  });

  describe('patchForm', () => {
    it('should patch the formGroup with initial values', () => {
      const mockFormValue = { ratesForm: {}, detailsForm: {}, termsForm: {}, protectionForm: {} };
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(mockFormValue);

      component['patchForm']();

      expect(component.formGroup.value).toEqual({
        detailsForm: {
          _downPayment_view: null,
          _enableDesiredInstalment: false,
          condition: '',
          dayOfFirstInstalment: 15,
          downPayment: null,
        },
        ratesForm: {
          _rate: null,
          creditDurationInMonths: null,
        },
        termsForm: {
          _agreeToBeAdvised: undefined,
          customerConditionsAccepted: false,
        },
      });
    });
  });
});
