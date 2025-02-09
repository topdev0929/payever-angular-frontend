import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture, paymentOptionsFixture } from '../../../../test';
import { PAY_SOURCES } from '../../app-details-constants';

import { FinanceDetailsFormComponent } from './finance-details-form.component';

describe('FinanceDetailsFormComponent', () => {

  let component: FinanceDetailsFormComponent;
  let fixture: ComponentFixture<FinanceDetailsFormComponent>;

  let store: Store;
  let formGroup: InstanceType<typeof FinanceDetailsFormComponent>['formGroup'];

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: NgControl, useValue: formControl },
      ],
      declarations: [
        FinanceDetailsFormComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
          formOptions: paymentOptionsFixture(),
        },
      },
    }));


    fixture = TestBed.createComponent(FinanceDetailsFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create form with default values', () => {

    const controls = formGroup.controls;

    expect(controls.monthlySalaryBeforeTax.value).toBeNull();
    expect(controls.totalDebt.value).toBeNull();
    expect(controls.totalTransportCostMonthly.value).toBeNull();
    expect(controls.insuranceForUnemployment.value).toBeFalsy();
    expect(controls.payWithMainIncome.value).toBeTruthy();
    expect(controls.totalRentMonthly.value).toBeNull();
    expect(controls.totalRentMonthly.disabled).toBeTruthy();
    expect(controls.paySource.value).toBeNull();
    expect(controls.paySource.disabled).toBeTruthy();
    expect(controls.otherPaySource.value).toBeNull();
    expect(controls.otherPaySource.disabled).toBeTruthy();

  });

  it('should set validators on form control', () => {

    expect(formGroup.get('monthlySalaryBeforeTax').validator).toBeTruthy();
    expect(formGroup.get('totalDebt').validator).toBeTruthy();
    expect(formGroup.get('totalTransportCostMonthly').validator).toBeTruthy();
    expect(formGroup.get('totalRentMonthly').validator).toBeTruthy();
    expect(formGroup.get('insuranceForUnemployment').validator).toBeFalsy();
    expect(formGroup.get('payWithMainIncome').validator).toBeFalsy();
    expect(formGroup.get('paySource').validator).toBeTruthy();
    expect(formGroup.get('otherPaySource').validator).toBeTruthy();

  });

  it('should disable paySource and otherPaySource when payWithMainIncome is true', () => {

    const event = { target: { checked: true } };

    formGroup.get('payWithMainIncome').setValue(event.target.checked);
    fixture.detectChanges();

    expect(formGroup.get('paySource').disabled).toBeTruthy();
    expect(formGroup.get('otherPaySource').disabled).toBeTruthy();

  });

  it('should toggle MonthlyAndDebt correctly', () => {

    component.ngOnInit();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            bankConsentForm: {
              ...paymentFormFixture().bankConsentForm,
              wasTaxProcessed: true,
            },
          },
        },
      },
    }));

    expect(formGroup.get('monthlySalaryBeforeTax').disabled).toBeTruthy();
    expect(formGroup.get('totalDebt').disabled).toBeTruthy();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            bankConsentForm: {
              ...paymentFormFixture().bankConsentForm,
              wasTaxProcessed: false,
            },
          },
        },
      },
    }));

    expect(formGroup.get('monthlySalaryBeforeTax').enabled).toBeTruthy();
    expect(formGroup.get('totalDebt').enabled).toBeTruthy();

  });

  it('should toggle RentMonthly correctly', () => {

    component.ngOnInit();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            personalForm: {
              ...paymentFormFixture().personalForm,
              residentialType: '1',
            },
          },
        },
      },
    }));

    expect(formGroup.get('totalRentMonthly').enabled).toBeTruthy();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: {
            ...paymentFormFixture(),
            personalForm: {
              ...paymentFormFixture().personalForm,
              residentialType: '10',
            },
          },
        },
      },
    }));

    expect(formGroup.get('totalRentMonthly').disabled).toBeTruthy();

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        form: {
          ...paymentFormFixture(),
          personalForm: {
            ...paymentFormFixture().personalForm,
            residentialType: 0,
          },
        },
      },
    }));

    expect(formGroup.get('totalRentMonthly').disabled).toBeTruthy();

  });

  it('should toggle PaySource correctly', () => {

    component.ngOnInit();

    formGroup.get('payWithMainIncome').setValue(true);
    expect(formGroup.get('paySource').disabled).toBeTruthy();
    expect(formGroup.get('otherPaySource').disabled).toBeTruthy();

    formGroup.get('payWithMainIncome').setValue(false);
    expect(formGroup.get('paySource').enabled).toBeTruthy();

  });

  it('should toggle OtherPaySource correctly', () => {

    component.ngOnInit();

    formGroup.get('paySource').setValue(99);
    expect(formGroup.get('otherPaySource').enabled).toBeTruthy();

    formGroup.get('paySource').setValue(10);
    expect(formGroup.get('otherPaySource').disabled).toBeTruthy();

  });

  it('should translate paySourceOptions with correct values', (done) => {

    const translateOptions = jest.spyOn(component as any, 'translateOptions');

    component.paySourceOptions$.subscribe(() => {
      expect(translateOptions).toHaveBeenCalledWith(paymentOptionsFixture().paySources, PAY_SOURCES);
      done();
    });

  });

});
