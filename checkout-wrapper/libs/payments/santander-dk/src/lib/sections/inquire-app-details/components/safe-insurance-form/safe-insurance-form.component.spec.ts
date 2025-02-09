import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetPayments, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../test';

import { SafeInsuranceFormComponent } from './safe-insurance-form.component';

describe('SafeInsuranceFormComponent', () => {

  let component: SafeInsuranceFormComponent;
  let fixture: ComponentFixture<SafeInsuranceFormComponent>;

  let store: Store;

  let formGroup: InstanceType<typeof SafeInsuranceFormComponent>['formGroup'];

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
      declarations: [SafeInsuranceFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(SafeInsuranceFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create form with default values', () => {

    expect(formGroup.get('wantsSafeInsurance').value).toBeFalsy();
    expect(formGroup.get('insuranceConditionsAccepted').value).toBeFalsy();

  });

  it('should enable insuranceConditionsAccepted when wantsSafeInsurance is true', () => {

    formGroup.get('wantsSafeInsurance').setValue(true);
    fixture.detectChanges();

    expect(formGroup.get('insuranceConditionsAccepted').enabled).toBe(true);

  });

  it('should disable insuranceConditionsAccepted when wantsSafeInsurance is false', () => {

    formGroup.get('wantsSafeInsurance').setValue(false);
    fixture.detectChanges();
    expect(formGroup.get('insuranceConditionsAccepted').disabled).toBe(true);

  });

  it('should set insurancePercent and insuranceMonthlyCost based on the store values', () => {

    jest.spyOn(component['percentPipe'], 'transform').mockReturnValue('10%');
    jest.spyOn(component['currencyPipe'], 'transform').mockReturnValue('€300');

    fixture.detectChanges();

    expect(component.translations.wantsSafeInsurance.text).toContain('10%');
    expect(component.translations.wantsSafeInsurance.text).toContain('€300');

  });

  it('should set translations correctly', () => {

    fixture.detectChanges();

    expect(component.translations.wantsSafeInsurance.label).toBeDefined();
    expect(component.translations.insuranceConditionsAccepted.title).toBeDefined();
    expect(component.translations.insuranceConditionsAccepted.text).toBeDefined();

  });

});

