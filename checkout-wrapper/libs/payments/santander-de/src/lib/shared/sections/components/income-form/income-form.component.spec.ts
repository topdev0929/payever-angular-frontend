import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { PatchFormState, PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { DE_RESIDENTIAL_TYPES, GuarantorRelation, PERSON_TYPE, PersonTypeEnum, ResidenceTypes } from '../../..';
import { flowWithPaymentOptionsFixture, formOptionsInstallmentFixture } from '../../../../test';
import { SectionsComponentsModule } from '../sections-components.module';

import { IncomeFormComponent } from './income-form.component';


describe('IncomeFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: IncomeFormComponent;
  let fixture: ComponentFixture<IncomeFormComponent>;
  let store: Store;

  const createComponent = (
    personType = PersonTypeEnum.Customer,
    guarantorRelation = GuarantorRelation.EQUIVALENT_HOUSEHOLD
  ) => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        SectionsComponentsModule,
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
        {
          provide: PERSON_TYPE,
          useValue: personType,
        },
      ],
      declarations: [
        IncomeFormComponent,
      ],
    }).compileComponents();

    registerLocaleData(de.default);

    jest.useFakeTimers({ legacyFakeTimers: true });

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
    store.dispatch(new PatchFormState({
      customer: {
        personalForm: {
          typeOfGuarantorRelation: guarantorRelation,
        },
      },
    }));

    fixture = TestBed.createComponent(IncomeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Customer', () => {
    beforeEach(() => {
      createComponent();
    });

    describe('Constructor', () => {
      it('Should check if component defined.', () => {
        expect(component).toBeDefined();
      });
    });


    describe('paymentOptions$', () => {
      it('should get correct paymentOptions', (done) => {
        const expectedOptions = {
          ...formOptionsInstallmentFixture,
          residentialTypes: formOptionsInstallmentFixture.residentialTypes.map(item => ({
            ...item,
            label: DE_RESIDENTIAL_TYPES?.[String(item.value)](item.label) ?? item.label,
          })),
        };
        component.paymentOptions$.subscribe((value) => {
          expect(value).toEqual(expectedOptions);
          done();
        });
      });
    });

    describe('ngOnInit', () => {
      it('should subscribe to value changes of otherIncome and enable sortOfIncome when otherIncome is true', () => {
        const otherIncomeControl = component.formGroup.get('otherIncome');
        const sortOfIncomeControl = component.formGroup.get('sortOfIncome');

        expect(sortOfIncomeControl.disabled).toBe(true);

        otherIncomeControl.setValue(true);

        expect(sortOfIncomeControl.enabled).toBe(true);
      });

      it('should subscribe to value changes of otherIncome and disable sortOfIncome when otherIncome is false',
        () => {
          const otherIncomeControl = component.formGroup.get('otherIncome');
          const sortOfIncomeControl = component.formGroup.get('sortOfIncome');

          otherIncomeControl.setValue(true);

          otherIncomeControl.setValue(false);

          expect(sortOfIncomeControl.disabled).toBe(true);
        },
      );

      it('should unsubscribe from observables onDestroy', () => {
        const destroySpy = jest.spyOn(component['destroy$'], 'next');
        const unsubscribeSpy = jest.spyOn(component['destroy$'], 'complete');

        fixture.destroy();

        expect(destroySpy).toHaveBeenCalled();
        expect(unsubscribeSpy).toHaveBeenCalled();
      });

      it('should get translations', () => {
        component.formGroup.get('incomeResidence').setValue('10' as any);
        expect(component.translations).toEqual({ housingCosts: 'Monthly rent' });

        component.formGroup.get('incomeResidence').setValue(ResidenceTypes.PROPERTY);
        expect(component.translations).toEqual({ housingCosts: 'Monthly mortgage' });

        component.formGroup.get('incomeResidence').setValue(ResidenceTypes.PAID_PROPERTY);
        expect(component.translations).toEqual({ housingCosts: 'Monthly additional costs' });
      });

      it('should handle income residence changed', fakeAsync(() => {
        const updateValueAndValidity = jest.spyOn(component.formGroup, 'updateValueAndValidity');
        component.ngOnInit();
        component.formGroup.get('incomeResidence').setValue('10' as any);
        tick(2000);
        expect(updateValueAndValidity).toHaveBeenCalled();
      }));
    });
  });

  describe('Guarantor', () => {
    it('should hide field with guarantorInSameHousehold', fakeAsync(() => {
      createComponent(PersonTypeEnum.Guarantor, GuarantorRelation.EQUIVALENT_HOUSEHOLD);
      [
        'netIncomePartner',
        'otherIncome',
        'rentalIncome',
        'incomeResidence',
        'housingCosts',
        'monthlyMaintenancePayments',
      ].forEach((field) => {
        expect(component.formGroup.get(field).enabled).toBe(false);
      });
    }));
  });
});
