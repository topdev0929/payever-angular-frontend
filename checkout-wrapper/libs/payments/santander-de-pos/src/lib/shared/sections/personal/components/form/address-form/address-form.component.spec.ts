import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDatepicker } from '@angular/material/datepicker';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { CompositeForm } from '@pe/checkout/forms';
import {
  PERSON_TYPE,
  PersonTypeEnum,
} from '@pe/checkout/santander-de-pos/shared';
import { PaymentState, SetFlow, SetPayments, PatchFormState } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../../../test/fixtures';
import { PersonalModule } from '../../../personal.module';

import { PreviousAddressFormComponent } from './address-form.component';

describe('AddressFormComponent', () => {

  let component: PreviousAddressFormComponent;
  let fixture: ComponentFixture<PreviousAddressFormComponent>;

  let formGroup: InstanceType<typeof PreviousAddressFormComponent>['formGroup'];
  let store: Store;
  const mockCountries = [{ label: 'EN', value: 'en' }, { label: 'DE', value: 'de' }];
  const newAddress = {
    city: 'City',
    country: 'de',
    streetName: 'Street',
    streetNumber: '32',
    zipCode: '21323',
  };

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(PersonalModule),
        { provide: NgControl, useValue: formControl },
        { provide: PERSON_TYPE, useValue: PersonTypeEnum.Customer },
      ],
      declarations: [
        PreviousAddressFormComponent,
        MatAutocomplete,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(PreviousAddressFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;
    jest.spyOn((component as any), 'getCountries').mockReturnValue(of(mockCountries));
    jest.spyOn(component['localeConstantsService'], 'getLang').mockReturnValue(mockCountries[0].value);

  });

  afterEach(() => {

    fixture?.destroy();
    jest.clearAllMocks();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should handle maxDate input correctly', () => {
    const maxDateNext = jest.spyOn(component.maxDate$, 'next');
    component.maxDate = new Date(2023, 1, 1);
    expect(maxDateNext).toHaveBeenCalled();
    expect(component.formGroup.get('prevAddressResidentSince').value).toBeNull();
  });

  it('should defined formGroup', () => {

    expect(formGroup.get('prevAddressResidentSince')).toBeTruthy();
    expect(formGroup.get('prevAddressResidentSince').validator).toBeTruthy();
    expect(formGroup.get('_prevAddressLine')).toBeTruthy();
    expect(formGroup.get('_prevAddressLine').validator).toBeTruthy();
    expect(formGroup.get('prevAddressCountry')).toBeTruthy();
    expect(formGroup.get('prevAddressCountry').validator).toBeTruthy();
    expect(formGroup.get('prevAddressCity')).toBeTruthy();
    expect(formGroup.get('prevAddressCity').validator).toBeTruthy();
    expect(formGroup.get('prevAddressZip')).toBeTruthy();
    expect(formGroup.get('prevAddressZip').validator).toBeTruthy();
    expect(formGroup.get('prevAddressStreet')).toBeTruthy();
    expect(formGroup.get('prevAddressStreet').validator).toBeTruthy();
    expect(formGroup.get('prevAddressStreetNumber')).toBeTruthy();
    expect(formGroup.get('prevAddressStreetNumber').validator).toBeTruthy();

  });

  it('should set correct default form values', () => {

    const prevAddressForm = paymentFormFixture()[PersonTypeEnum.Customer].prevAddressForm;

    expect(formGroup.get('prevAddressResidentSince').value).toEqual(prevAddressForm.prevAddressResidentSince);
    expect(formGroup.get('_prevAddressLine').value).toEqual(prevAddressForm._prevAddressLine);
    expect(formGroup.get('prevAddressCountry').value).toEqual(prevAddressForm.prevAddressCountry);
    expect(formGroup.get('prevAddressCity').value).toEqual(prevAddressForm.prevAddressCity);
    expect(formGroup.get('prevAddressZip').value).toEqual(prevAddressForm.prevAddressZip);
    expect(formGroup.get('prevAddressStreet').value).toEqual(prevAddressForm.prevAddressStreet);
    expect(formGroup.get('prevAddressStreetNumber').value).toEqual(prevAddressForm.prevAddressStreetNumber);

  });

  it('should enforce require validators to the form', () => {

    const testText = 'test';

    const _prevAddressLine = formGroup.get('_prevAddressLine');
    const prevAddressCountry = formGroup.get('prevAddressCountry');
    const prevAddressCity = formGroup.get('prevAddressCity');
    const prevAddressZip = formGroup.get('prevAddressZip');
    const prevAddressStreet = formGroup.get('prevAddressStreet');
    const prevAddressStreetNumber = formGroup.get('prevAddressStreetNumber');

    _prevAddressLine.setValue(null);
    prevAddressCountry.setValue(null);
    prevAddressCity.setValue(null);
    prevAddressZip.setValue(null);
    prevAddressStreet.setValue(null);
    prevAddressStreetNumber.setValue(null);

    expect(_prevAddressLine.valid).toBeFalsy();
    expect(prevAddressCountry.valid).toBeFalsy();
    expect(prevAddressCity.valid).toBeFalsy();
    expect(prevAddressZip.valid).toBeFalsy();
    expect(prevAddressStreet.valid).toBeFalsy();
    expect(prevAddressStreetNumber.valid).toBeFalsy();

    _prevAddressLine.setValue(testText);
    prevAddressCountry.setValue(testText);
    prevAddressCity.setValue(testText);
    prevAddressZip.setValue(testText);
    prevAddressStreet.setValue(testText);
    prevAddressStreetNumber.setValue(testText);

    expect(_prevAddressLine.valid).toBeTruthy();
    expect(prevAddressCountry.valid).toBeTruthy();
    expect(prevAddressCity.valid).toBeTruthy();
    expect(prevAddressZip.valid).toBeFalsy();
    expect(prevAddressStreet.valid).toBeTruthy();
    expect(prevAddressStreetNumber.valid).toBeTruthy();

  });

  it('should correctly update full address', (done) => {

    component.ngOnInit();

    formGroup.get('prevAddressCity').setValue(newAddress.city);
    formGroup.get('prevAddressCountry').setValue(newAddress.country);
    formGroup.get('prevAddressStreet').setValue(newAddress.streetName);
    formGroup.get('prevAddressStreetNumber').setValue(newAddress.streetNumber);
    formGroup.get('prevAddressZip').setValue(newAddress.zipCode);

    formGroup.valueChanges.subscribe(() => {
      expect(formGroup.get('_prevAddressLine').value)
        .toEqual(`${newAddress.streetName} ${newAddress.streetNumber}, ${newAddress.city}, ${newAddress.zipCode}, ${newAddress.country}`);

      done();
    });

  });

  it('should update form values on full address change', () => {

    component.fullAddressChange(newAddress);

    expect(formGroup.get('prevAddressCountry').value).toEqual(newAddress.country);
    expect(formGroup.get('prevAddressCity').value).toEqual(newAddress.city);
    expect(formGroup.get('prevAddressZip').value).toEqual(newAddress.zipCode);
    expect(formGroup.get('prevAddressStreet').value).toEqual(newAddress.streetName);
    expect(formGroup.get('prevAddressStreetNumber').value).toEqual(newAddress.streetNumber);

  });

  it('should parse full address correctly', () => {

    expect(component['parseFullAddress'](newAddress, mockCountries))
      .toEqual(`${newAddress.streetName} ${newAddress.streetNumber}, ${newAddress.city}, ${newAddress.zipCode}, ${mockCountries[1].label}`);

    expect(component['parseFullAddress']({ ...newAddress, streetNumber: null }, mockCountries))
      .toEqual(`${newAddress.streetName} , ${newAddress.city}, ${newAddress.zipCode}, ${mockCountries[1].label}`);

    expect(component['parseFullAddress']({ ...newAddress, streetName: null }, mockCountries))
      .toEqual(`${newAddress.city}, ${newAddress.zipCode}, ${mockCountries[1].label}`);

  });

  describe('prevAddressFormValue', () => {
    it('should get prevAddressFormValue', () => {
      expect(component.prevAddressFormValue).toEqual(paymentFormFixture()[PersonTypeEnum.Customer].prevAddressForm);
    });

    it('should get empty object', () => {
      const form = store.selectSnapshot(PaymentState.form);
      store.dispatch(new PatchFormState({
        ...form,
        [PersonTypeEnum.Customer]: {
          ...form[PersonTypeEnum.Customer],
          prevAddressForm: null,
        },
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(PreviousAddressFormComponent);
      component = fixture.componentInstance;

      expect(component.prevAddressFormValue).toEqual({});
    });

  });

  it('should selectPrevAddressResidentSince perform correctly', () => {

    const date = new Date(2022, 11, 13);
    const datepicker = {
      close: jest.fn(),
    } as unknown as MatDatepicker<unknown>;
    const expectedDate = new Date(date.getFullYear(), date.getMonth(), new Date().getDay());

    component.selectPrevAddressResidentSince(date, datepicker);
    expect(datepicker.close).toHaveBeenCalled();
    expect(component.formGroup.get('prevAddressResidentSince').value).toEqual(expectedDate);

  });

});
