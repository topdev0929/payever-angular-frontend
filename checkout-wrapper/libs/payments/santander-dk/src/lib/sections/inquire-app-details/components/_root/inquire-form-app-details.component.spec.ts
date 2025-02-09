import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  FormGroupDirective,
  NgControl,
} from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { AddressAutocompleteService } from '@pe/checkout/forms/address-autocomplete';
import { SetPayments, SetFlow, PatchFormState } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  SharedModule,
} from '../../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture, paymentOptionsFixture } from '../../../../test';
import { BankDetailsFormComponent } from '../bank-details-form';
import { CarsFormComponent } from '../cars-form';
import { ChildrenFormComponent } from '../children-form';
import { ConfirmFormComponent } from '../confirm-form';
import { CprDetailsFormComponent } from '../cpr-details';
import { ExposedPersonFormComponent } from '../exposed-person-form';
import { FinanceDetailsFormComponent } from '../finance-details-form';
import { EmploymentTypeEnum, PersonalFormComponent } from '../personal-form';
import { SafeInsuranceFormComponent } from '../safe-insurance-form';

import { InquireFormAppDetailsComponent } from './inquire-form-app-details.component';

describe('InquireFormAppDetailsComponent', () => {

  let component: InquireFormAppDetailsComponent;
  let fixture: ComponentFixture<InquireFormAppDetailsComponent>;

  let store: Store;

  let formGroup: InstanceType<typeof InquireFormAppDetailsComponent>['formGroup'];

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        { provide: NgControl, useValue: formControl },
        FormGroupDirective,
        AnalyticsFormService,
        AddressAutocompleteService,
      ],
      declarations: [
        InquireFormAppDetailsComponent,
        PersonalFormComponent,
        ChildrenFormComponent,
        CarsFormComponent,
        BankDetailsFormComponent,
        CprDetailsFormComponent,
        ExposedPersonFormComponent,
        SafeInsuranceFormComponent,
        FinanceDetailsFormComponent,
        ConfirmFormComponent,
        MatAutocomplete,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
          paymentOptions: paymentOptionsFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(InquireFormAppDetailsComponent);
    component = fixture.componentInstance;

    component['formGroupDirective'] = {
      onSubmit: jest.fn(),
    } as unknown as FormGroupDirective;

    formGroup = component.formGroup;

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should patch form value on init', () => {

    component.ngOnInit();

    expect(formGroup.get('bankConsentForm').value).toEqual(paymentFormFixture().bankConsentForm);
    expect(formGroup.get('personalForm').value).toEqual(paymentFormFixture().personalForm);
    expect(formGroup.get('cprDetailsForm').value).toEqual(paymentFormFixture().cprDetailsForm);

  });

  it('should dispatch state on value changes', () => {

    const dispatch = jest.spyOn(store, 'dispatch');
    const expectedValue: any = {
      bankRegistrationNumber: 'new-bankRegistrationNumber',
      bankAccountNumber: 'new-bankAccountNumber',
      eCard: false,
    };

    component.ngOnInit();
    formGroup.get('bankDetailsForm').setValue(expectedValue);

    expect(dispatch).toHaveBeenCalledWith(new PatchFormState({ ...formGroup.value, bankDetailsForm: expectedValue }));

  });

  it('should hide cpr-details-form when wasCPRProcessed is true', () => {
    const cprDetailsForm = formGroup.get('cprDetailsForm');
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            bankConsentForm: {
              ...paymentFormFixture().bankConsentForm,
              wasCPRProcessed: true,
            },
          },
        },
      },
    }));
    fixture.detectChanges();
    expect(cprDetailsForm.enabled).toBe(false);
    expect(fixture.debugElement.query(By.directive(CprDetailsFormComponent))).toBeFalsy();
  });

  it('should show cpr-details-form when wasCPRProcessed is false', () => {
    const cprDetailsForm = formGroup.get('cprDetailsForm');
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            bankConsentForm: {
              ...paymentFormFixture().bankConsentForm,
              wasCPRProcessed: false,
            },
          },
        },
      },
    }));
    fixture.detectChanges();
    expect(cprDetailsForm.enabled).toBe(true);
    expect(fixture.debugElement.query(By.directive(CprDetailsFormComponent))).toBeTruthy();
  });

  it('should toggle CprDetailsForm', () => {

    component.ngOnInit();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            bankConsentForm: {
              ...paymentFormFixture().bankConsentForm,
              wasCPRProcessed: true,
            },
          },
        },
      },
    }));

    expect(formGroup.get('cprDetailsForm').disabled).toBeTruthy();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            bankConsentForm: {
              ...paymentFormFixture().bankConsentForm,
              wasCPRProcessed: false,
            },
          },
        },
      },
    }));

    expect(formGroup.get('cprDetailsForm').enabled).toBeTruthy();

  });

  it('should toggle SafeInsuranceForm', () => {

    component.ngOnInit();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            cprDetailsForm: {
              ...paymentFormFixture().cprDetailsForm,
              _insuranceEnabled: true,
            },
          },
        },
      },
    }));

    expect(formGroup.get('safeInsuranceForm').enabled).toBeTruthy();


    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            bankConsentForm: {
              ...paymentFormFixture().bankConsentForm,
              _insuranceEnabled: false,
            },
          },
        },
      },
    }));

    expect(formGroup.get('safeInsuranceForm').disabled).toBeTruthy();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            personalForm: {
              ...paymentFormFixture().personalForm,
              _disableSafeInsurance: false,
            },
          },
        },
      },
    }));

    expect(formGroup.get('safeInsuranceForm').enabled).toBeTruthy();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            cprDetailsForm: {
              ...paymentFormFixture().cprDetailsForm,
              _insuranceEnabled: false,
            },
            personalForm: {
              ...paymentFormFixture().personalForm,
              _disableSafeInsurance: true,
            },
          },
        },
      },
    }));

    expect(formGroup.get('safeInsuranceForm').disabled).toBeTruthy();

  });

  it('should handle onSubmit', () => {

    const expectedResult: any = {
      personalForm: paymentFormFixture().personalForm,
      childrenForm: paymentFormFixture().childrenForm,
      carsForm: paymentFormFixture().carsForm,
      bankDetailsForm: paymentFormFixture().bankDetailsForm,
      cprDetailsForm: paymentFormFixture().cprDetailsForm,
      exposedPersonForm: paymentFormFixture().exposedPersonForm,
      safeInsuranceForm: paymentFormFixture().safeInsuranceForm,
      financeDetailsForm: paymentFormFixture().financeDetailsForm,
      confirmForm: paymentFormFixture().confirmForm,
      bankConsentForm: paymentFormFixture().bankDetailsForm,
    };

    jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
    const onSubmitSpy = jest.spyOn(component['formGroupDirective'], 'onSubmit');
    const submittedEmit = jest.spyOn(component.submitted, 'emit');

    component.formGroup.setValue(expectedResult);
    component.onSubmit();

    expect(onSubmitSpy).toHaveBeenCalledWith(null);
    expect(submittedEmit).toHaveBeenCalledWith(expectedResult);

  });

  it('should handle employmentType before submit', () => {

    const formValues: any = {
      personalForm: {
        ...paymentFormFixture().personalForm,
        employmentType: EmploymentTypeEnum.PART_TIME_MORE,
      },
      childrenForm: paymentFormFixture().childrenForm,
      carsForm: paymentFormFixture().carsForm,
      bankDetailsForm: paymentFormFixture().bankDetailsForm,
      cprDetailsForm: paymentFormFixture().cprDetailsForm,
      exposedPersonForm: paymentFormFixture().exposedPersonForm,
      safeInsuranceForm: paymentFormFixture().safeInsuranceForm,
      financeDetailsForm: paymentFormFixture().financeDetailsForm,
      confirmForm: paymentFormFixture().confirmForm,
      bankConsentForm: paymentFormFixture().bankDetailsForm,
    };

    const expectedResult: any = {
      personalForm: {
        ...paymentFormFixture().personalForm,
        employmentType: EmploymentTypeEnum.PART_TIME_BELOW,
      },
      childrenForm: paymentFormFixture().childrenForm,
      carsForm: paymentFormFixture().carsForm,
      bankDetailsForm: paymentFormFixture().bankDetailsForm,
      cprDetailsForm: paymentFormFixture().cprDetailsForm,
      exposedPersonForm: paymentFormFixture().exposedPersonForm,
      safeInsuranceForm: paymentFormFixture().safeInsuranceForm,
      financeDetailsForm: paymentFormFixture().financeDetailsForm,
      confirmForm: paymentFormFixture().confirmForm,
      bankConsentForm: paymentFormFixture().bankDetailsForm,
    };

    jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
    jest.spyOn(component['formGroupDirective'], 'onSubmit');
    const submittedEmit = jest.spyOn(component.submitted, 'emit');

    component.formGroup.setValue(formValues);
    component.onSubmit();

    expect(submittedEmit).toHaveBeenCalledWith(expectedResult);

  });

  it('should handle invalid on submit', () => {

    const submittedEmit = jest.spyOn(component.submitted, 'emit');

    component.onSubmit();

    expect(component.formGroup.invalid).toBeTruthy();
    expect(submittedEmit).not.toHaveBeenCalled();

  });

});
