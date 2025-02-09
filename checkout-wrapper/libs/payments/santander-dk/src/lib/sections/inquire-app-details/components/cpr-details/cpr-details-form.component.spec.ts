import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { AddressAutocompleteService } from '@pe/checkout/forms/address-autocomplete';
import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodeDenmarkInsuranceConfigData, PaymentMethodEnum } from '@pe/checkout/types';

import { CprDetailsFormValue, SantanderDkApiService, SantanderDkFlowService } from '../../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../test';

import { CprDetailsFormComponent } from './cpr-details-form.component';

describe('CprDetailsFormComponent', () => {

  let component: CprDetailsFormComponent;
  let fixture: ComponentFixture<CprDetailsFormComponent>;

  let store: Store;
  let flowService: SantanderDkFlowService;

  const mockInsuranceConfig: NodeDenmarkInsuranceConfigData = {
    insuranceEnabled: true,
    insuranceMonthlyCost: 100,
    insurancePercent: 10,
  };

  let formGroup: InstanceType<typeof CprDetailsFormComponent>['formGroup'];

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderDkFlowService,
        AddressAutocompleteService,
        SantanderDkApiService,
        { provide: NgControl, useValue: formControl },
      ],
      declarations: [
        CprDetailsFormComponent,
        MatAutocomplete,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        form: paymentFormFixture(),
      },
    }));
    flowService = TestBed.inject(SantanderDkFlowService);

     jest.spyOn(flowService, 'getInsuranceConfig').mockReturnValue(of(mockInsuranceConfig));

    fixture = TestBed.createComponent(CprDetailsFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create form with default values', () => {

    expect(formGroup.get('_addressLine').value).toEqual('');
    expect(formGroup.get('firstName').value).toBeNull();
    expect(formGroup.get('lastName').value).toBeNull();
    expect(formGroup.get('socialSecurityNumber').value).toBeNull();
    expect(formGroup.get('city').value).toBeNull();
    expect(formGroup.get('address').value).toBeNull();
    expect(formGroup.get('postalCode').value).toBeNull();
    expect(formGroup.get('_insuranceEnabled').value).toBeNull();
    expect(formGroup.get('_insuranceMonthlyCost').value).toBeNull();
    expect(formGroup.get('_insurancePercent').value).toBeNull();

  });

  it('should set validators on form control', () => {

    expect(formGroup.get('_addressLine').validator).toBeFalsy();
    expect(formGroup.get('firstName').validator).toBeTruthy();
    expect(formGroup.get('lastName').validator).toBeTruthy();
    expect(formGroup.get('socialSecurityNumber').validator).toBeTruthy();
    expect(formGroup.get('city').validator).toBeTruthy();
    expect(formGroup.get('address').validator).toBeTruthy();
    expect(formGroup.get('postalCode').validator).toBeTruthy();
    expect(formGroup.get('_insuranceEnabled').validator).toBeFalsy();
    expect(formGroup.get('_insuranceMonthlyCost').validator).toBeFalsy();
    expect(formGroup.get('_insurancePercent').validator).toBeFalsy();

  });

  it('should update insurance fields on socialSecurityNumber value change', (done) => {

    formGroup.get('socialSecurityNumber').patchValue('validSSN');

    setTimeout(() => {
      expect(formGroup.get('_insuranceEnabled').value).toEqual(mockInsuranceConfig.insuranceEnabled);
      expect(formGroup.get('_insurancePercent').value).toEqual(mockInsuranceConfig.insurancePercent);
      expect(formGroup.get('_insuranceMonthlyCost').value).toEqual(mockInsuranceConfig.insuranceMonthlyCost);
      done();
    }, 301);

  });

  it('should patch form value through writeValue', () => {
    const testFormValue: CprDetailsFormValue = {
      _addressLine: 'test',
      firstName: 'Name',
      lastName: 'Surname',
      socialSecurityNumber: 'ssnValid',
      city: flowWithPaymentOptionsFixture().billingAddress.city,
      address: flowWithPaymentOptionsFixture().billingAddress.street,
      postalCode: flowWithPaymentOptionsFixture().billingAddress.zipCode,
      _insuranceEnabled: true,
      _insuranceMonthlyCost: 100,
      _insurancePercent: 10,
    };

    component.writeValue(testFormValue);

    expect(formGroup.value).toEqual(testFormValue);

  });

  it('should update full address when city, address or postalCode changes', () => {

    const testCity = 'New City';
    const testAddress = '12 New Address St';
    const testPostalCode = '1111';

    formGroup.get('city').setValue(testCity);
    formGroup.get('address').setValue(testAddress);
    formGroup.get('postalCode').setValue(testPostalCode);

    expect(formGroup.get('_addressLine').value).toEqual(`${testAddress}, ${testCity}, ${testPostalCode}`);

  });

  it('should update city, address or postalCode when full address change', () => {

    const testFullAddress = '12 New Address St, New City, 1111';
    const splitAddress = testFullAddress.split(', ');

    component.fullAddressChange({
      streetName: splitAddress[0],
      city: splitAddress[1],
      zipCode: splitAddress[2],
    });

    expect(formGroup.get('_addressLine').value).toEqual(testFullAddress);

    expect(formGroup.get('address').value).toEqual(splitAddress[0]);
    expect(formGroup.get('city').value).toEqual(splitAddress[1]);
    expect(formGroup.get('postalCode').value).toEqual(splitAddress[2]);

  });

  it('should social security number mask work correctly', () => {

    const masked = component.socialSecurityNumberMask('a123456789012');

    expect(masked).toEqual('123456-7890');

  });

  it('should social security number unmask work correctly', () => {

    const masked = component.socialSecurityNumberUnmask('123456-7890');

    expect(masked).toEqual('1234567890');

  });

});
