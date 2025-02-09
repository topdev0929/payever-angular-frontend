import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../test';

import { PersonalFormComponent } from './personal-form.component';

describe('PersonalFormComponent', () => {
  let component: PersonalFormComponent;
  let fixture: ComponentFixture<PersonalFormComponent>;

  let store: Store;

  let formGroup: InstanceType<typeof PersonalFormComponent>['formGroup'];

  beforeEach(() => {
    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper(), { provide: NgControl, useValue: formControl }],
      declarations: [PersonalFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(
      new SetPayments({
        [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
          form: paymentFormFixture(),
        },
      })
    );

    fixture = TestBed.createComponent(PersonalFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should create form with default values', () => {
    const controls = formGroup.controls;

    expect(controls.phoneNumber.value).toBeNull();
    expect(controls.emailAddress.value).toBeNull();
    expect(controls._confirmEmail.value).toBeNull();
    expect(controls.productConsentOptOut.value).toBeFalsy();
    expect(controls.maritalStatus.value).toBeNull();
    expect(controls.citizenship.value).toBeNull();
    expect(controls._householdExpenses.value).toBeNull();
    expect(controls._householdExpenses.disabled).toBeTruthy();
    expect(controls.householdBudgetPercentage.value).toBeNull();
    expect(controls.householdBudgetPercentage.disabled).toBeTruthy();
    expect(controls.residencePermitNumber.value).toBeNull();
    expect(controls.residencePermitNumber.disabled).toBeTruthy();
    expect(controls.residencePermitType.value).toBeNull();
    expect(controls.residencePermitType.disabled).toBeTruthy();
    expect(controls.residencePermitDate.value).toBeNull();
    expect(controls.residencePermitDate.disabled).toBeTruthy();
    expect(controls.employmentType.value).toBeNull();
    expect(controls.employedSince.value).toBeNull();
    expect(controls.currentYearDebt.value).toBeNull();
  });

  it('should set validators on form control', () => {
    expect(formGroup.get('phoneNumber').validator).toBeTruthy();
    expect(formGroup.get('emailAddress').validator).toBeTruthy();
    expect(formGroup.get('_confirmEmail').validator).toBeTruthy();
    expect(formGroup.get('productConsentOptOut').validator).toBeFalsy();
    expect(formGroup.get('maritalStatus').validator).toBeTruthy();
    expect(formGroup.get('citizenship').validator).toBeTruthy();
    expect(formGroup.get('_householdExpenses').validator).toBeTruthy();
    expect(formGroup.get('householdBudgetPercentage').validator).toBeTruthy();
    expect(formGroup.get('residencePermitNumber').validator).toBeTruthy();
    expect(formGroup.get('residencePermitType').validator).toBeTruthy();
    expect(formGroup.get('residencePermitDate').validator).toBeTruthy();
    expect(formGroup.get('employmentType').validator).toBeTruthy();
    expect(formGroup.get('employedSince').validator).toBeTruthy();
    expect(formGroup.get('currentYearDebt').validator).toBeTruthy();
  });

  it('should disable residence permit fields for non-other citizenship', () => {
    formGroup.get('citizenship').setValue('2' as any);
    expect(formGroup.get('residencePermitNumber').disabled).toBeTruthy();
    expect(formGroup.get('residencePermitType').disabled).toBeTruthy();
    expect(formGroup.get('residencePermitDate').disabled).toBeTruthy();
  });

  it('should enable residence permit fields for "other" citizenship', () => {
    formGroup.get('citizenship').setValue('1' as any);
    expect(formGroup.get('residencePermitNumber').enabled).toBeTruthy();
    expect(formGroup.get('residencePermitType').enabled).toBeTruthy();
    expect(formGroup.get('residencePermitDate').enabled).toBeTruthy();
  });

  it('should enable householdBudgetPercentage based on householdExpenses', () => {
    formGroup.get('maritalStatus').setValue('1' as any);
    formGroup.get('_householdExpenses').setValue(true);
    expect(formGroup.get('householdBudgetPercentage').enabled).toBeTruthy();
    formGroup.get('_householdExpenses').setValue('');
    expect(formGroup.get('householdBudgetPercentage').disabled).toBeTruthy();
  });

  it('should toggle householdExpenses control based on maritalStatus', () => {
    formGroup.get('maritalStatus').setValue('1' as any);
    expect(formGroup.get('_householdExpenses').enabled).toBeTruthy();
    formGroup.get('maritalStatus').setValue('3' as any);
    expect(formGroup.get('_householdExpenses').disabled).toBeTruthy();
  });
});
