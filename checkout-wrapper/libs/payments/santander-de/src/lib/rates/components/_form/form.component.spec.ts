import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { skip, tap } from 'rxjs/operators';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { ChooseRateComponent, KitChooseRateComponent, KitRateViewComponent } from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { FinanceTypeEnum, PaymentMethodEnum } from '@pe/checkout/types';
import { PaymentTextComponent, PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { RatesCalculationService } from '../../../shared/services';
import { RateInterface } from '../../../shared/types';
import { flowWithPaymentOptionsFixture, formOptionsInstallmentFixture, rateFixture, ratesFixture } from '../../../test';
import { RatesEditListComponent } from '../rates-edit-list';
import { RatesFormComponent } from '../rates-form';
import { TermsFormComponent } from '../terms-form';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  const storeHelper = new StoreHelper();


  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let store: Store;
  let ratesCalculationService: RatesCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutFormsCoreModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        CurrencyPipe,
        PercentPipe,
        RatesCalculationService,
        { provide: PaymentInquiryStorage, useValue: {} },
      ],
      declarations: [
        PaymentTextComponent,
        RatesFormComponent,
        TermsFormComponent,
        RatesEditListComponent,
        ChooseRateComponent,
        KitChooseRateComponent,
        KitRateViewComponent,
        FormComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: formOptionsInstallmentFixture,
        },
      },
    }));
    ratesCalculationService = TestBed.inject(RatesCalculationService);

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should patch form data and set up valueChanges subscription', () => {
      const formValue = { /* Create a mock form value */ };
      const patchFormStateSpy = jest.spyOn(store, 'dispatch').mockImplementation();

      jest.spyOn(store, 'selectSnapshot').mockReturnValue(formValue);

      const valueChangesSpy = jest.spyOn(component.formGroup.valueChanges, 'pipe').mockReturnValue(of(true));

      component.ngOnInit();

      expect(patchFormStateSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(valueChangesSpy).toHaveBeenCalled();
    });
  });

  describe('Output', () => {
    it('should handle submitted', (done) => {
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);

      component.ngOnInit();
      component.submitted.subscribe((v) => {
        expect(v).toEqual(component.formGroup.value);
        done();
      });

      component.formGroup.updateValueAndValidity();
      component['submit$'].next(Date.now());
    });
  });

  describe('onSelectRate', () => {
    it('should handle onSelectRate', () => {
      const rate = rateFixture();
      const emitSpy = jest.spyOn(component.selectRate, 'emit');
      const setValueSpy = jest.spyOn(component.formGroup.get('hiddenForm.credit_duration_in_months'), 'setValue');

      component.onSelectRate(rate);

      expect(emitSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(setValueSpy).toHaveBeenCalledWith(rate.duration);
    });
  });

  describe('prepareRateSummary', () => {
    it('should prepare rate summary', () => {
      const rate: RateInterface = rateFixture();

      const currencyPipe = TestBed.inject(CurrencyPipe);

      const currencyPipeTransformSpy = jest.spyOn(currencyPipe, 'transform').mockReturnValue('$1,000.00');

      const financeType = FinanceTypeEnum.FINANCE_CALCULATOR;
      component.flow.financeType = financeType;

      const rateSummary = component['prepareRateSummary'](rate);

      expect(rateSummary).toEqual({
        chooseText: '$1,000.006 ',
        totalAmount: 4000,
        downPayment: 0,
      });

      expect(currencyPipeTransformSpy).toHaveBeenCalledWith(666.66, component.flow.currency, 'symbol');
    });
  });

  describe('initialRate', () => {

    it('should find correct rate', (done) => {
      const fetchRates = jest.spyOn(ratesCalculationService, 'fetchRates')
        .mockReturnValue(of(ratesFixture()));

      component.rates$.pipe(
        skip(1),
        tap((v) => {
          expect(v).toEqual(ratesFixture());
          expect(fetchRates).toHaveBeenCalledWith(flowWithPaymentOptionsFixture(), {
            ...component.formGroup.get('ratesForm').value,
            cpi: false,
          });
          expect(fetchRates).toHaveBeenCalled();
          expect(component['initialRate']).toEqual(ratesFixture()[ratesFixture().length - 1]);
          done();
        }),
      ).subscribe();
      component.formGroup.get('hiddenForm.credit_duration_in_months').setValue(72);
    });
    it('should set first rate if duration does not match', (done) => {
      const fetchRates = jest.spyOn(ratesCalculationService, 'fetchRates')
        .mockReturnValue(of(ratesFixture()));

      component.rates$.pipe(
        skip(1),
        tap((v) => {
          expect(v).toEqual(ratesFixture());
          expect(fetchRates).toHaveBeenCalledWith(flowWithPaymentOptionsFixture(), {
            ...component.formGroup.get('ratesForm').value,
            cpi: false,
          });
          expect(component['initialRate']).toEqual(ratesFixture()[0]);
          done();
        }),
      ).subscribe();
      component.formGroup.get('hiddenForm.credit_duration_in_months').setValue(10000);
    });
  });
});
