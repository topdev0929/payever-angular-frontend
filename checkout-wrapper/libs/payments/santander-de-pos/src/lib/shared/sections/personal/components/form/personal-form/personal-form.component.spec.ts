import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';

import { CompositeForm } from '@pe/checkout/forms';
import { PhoneValidators } from '@pe/checkout/forms/phone';
import {
  PERSON_TYPE,
  PersonTypeEnum,
} from '@pe/checkout/santander-de-pos/shared';
import { PaymentState, SetFlow, SetPayments, PatchFormState } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentOptionsFixture } from '../../../../../../test/fixtures';
import { GuarantorRelation } from '../../../../../common';
import { PersonalModule } from '../../../personal.module';

import { PersonalFormComponent } from './personal-form.component';

describe('PersonalFormComponent', () => {

  let component: PersonalFormComponent;
  let fixture: ComponentFixture<PersonalFormComponent>;

  let formGroup: InstanceType<typeof PersonalFormComponent>['formGroup'];
  let store: Store;

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
        PersonalFormComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: paymentOptionsFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(PersonalFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

  });

  afterEach(() => {

    fixture?.destroy();
    jest.clearAllMocks();
    jest.resetAllMocks();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should disableProfessionAndDateOfBirth return false', () => {

    expect(component['merchantMode']).toBeUndefined();
    expect(component['disableProfessionAndDateOfBirth']).toBeFalsy();

  });

  it('should defined formGroup', () => {

    expect(formGroup.get('typeOfIdentification')).toBeTruthy();
    expect(formGroup.get('typeOfIdentification').validator).toBeFalsy();

    expect(formGroup.get('personalDateOfBirth')).toBeTruthy();
    expect(formGroup.get('personalDateOfBirth').disabled).toBeFalsy();
    expect(formGroup.get('personalDateOfBirth').validator).toBeTruthy();

    expect(formGroup.get('profession')).toBeTruthy();
    expect(formGroup.get('profession').disabled).toBeFalsy();
    expect(formGroup.get('profession').validator).toBeTruthy();

    expect(formGroup.get('addressMobilePhoneNumber')).toBeTruthy();
    expect(formGroup.get('addressMobilePhoneNumber').disabled).toBeFalsy();
    expect(formGroup.get('addressMobilePhoneNumber').validator).toBeTruthy();

    expect(formGroup.get('addressMobilePhoneNumber')).toBeTruthy();
    expect(formGroup.get('addressMobilePhoneNumber').validator).toBeTruthy();

    expect(formGroup.get('addressPhoneNumber')).toBeTruthy();
    expect(formGroup.get('addressPhoneNumber').validator).toBeTruthy();

    expect(formGroup.get('addressResidentSince')).toBeTruthy();
    expect(formGroup.get('addressResidentSince').validator).toBeTruthy();

    expect(formGroup.get('identificationNumber')).toBeTruthy();
    expect(formGroup.get('identificationNumber').validator).toBeTruthy();

    expect(formGroup.get('identificationPlaceOfIssue')).toBeTruthy();
    expect(formGroup.get('identificationPlaceOfIssue').validator).toBeTruthy();

    expect(formGroup.get('identificationDateOfIssue')).toBeTruthy();
    expect(formGroup.get('identificationDateOfIssue').validator).toBeTruthy();

    expect(formGroup.get('identificationDateOfExpiry')).toBeTruthy();
    expect(formGroup.get('identificationDateOfExpiry').validator).toBeTruthy();

    expect(formGroup.get('identificationIssuingAuthority')).toBeTruthy();
    expect(formGroup.get('identificationIssuingAuthority').validator).toBeTruthy();

    expect(formGroup.get('numberOfChildren')).toBeTruthy();
    expect(formGroup.get('numberOfChildren').validator).toBeTruthy();

    expect(formGroup.get('personalMaritalStatus')).toBeTruthy();
    expect(formGroup.get('personalMaritalStatus').validator).toBeTruthy();

    expect(formGroup.get('personalNationality')).toBeTruthy();
    expect(formGroup.get('personalNationality').validator).toBeTruthy();

    expect(formGroup.get('personalPlaceOfBirth')).toBeTruthy();
    expect(formGroup.get('personalPlaceOfBirth').validator).toBeTruthy();

    expect(formGroup.get('personalBirthName')).toBeTruthy();
    expect(formGroup.get('personalBirthName').validator).toBeTruthy();

  });

  it('should enforce min max validators to the form controls', () => {

    const identificationNumber = formGroup.get('identificationNumber');
    const identificationPlaceOfIssue = formGroup.get('identificationPlaceOfIssue');
    const identificationIssuingAuthority = formGroup.get('identificationIssuingAuthority');
    const personalPlaceOfBirth = formGroup.get('personalPlaceOfBirth');
    const numberOfChildren = formGroup.get('numberOfChildren');

    identificationNumber.setValue([...Array(10)].map((_, i) => String(i)).join('').repeat(3));
    identificationPlaceOfIssue.setValue([...Array(10)].map((_, i) => String(i)).join('').repeat(6));
    identificationIssuingAuthority.setValue([...Array(10)].map((_, i) => String(i)).join('').repeat(6));
    personalPlaceOfBirth.setValue([...Array(10)].map((_, i) => String(i)).join('').repeat(4));
    numberOfChildren.setValue(-1);

    fixture.detectChanges();

    expect(identificationNumber.valid).toBeFalsy();
    expect(identificationPlaceOfIssue.valid).toBeFalsy();
    expect(identificationIssuingAuthority.valid).toBeFalsy();
    expect(personalPlaceOfBirth.valid).toBeFalsy();
    expect(numberOfChildren.valid).toBeFalsy();

    identificationNumber.setValue([...Array(10)].map((_, i) => String(i)).join('').repeat(2));
    identificationPlaceOfIssue.setValue([...Array(10)].map((_, i) => String(i)).join('').repeat(5));
    identificationIssuingAuthority.setValue([...Array(10)].map((_, i) => String(i)).join('').repeat(5));
    personalPlaceOfBirth.setValue([...Array(10)].map((_, i) => String(i)).join('').repeat(3));
    numberOfChildren.setValue(2);

    fixture.detectChanges();

    expect(identificationNumber.valid).toBeTruthy();
    expect(identificationPlaceOfIssue.valid).toBeTruthy();
    expect(identificationIssuingAuthority.valid).toBeTruthy();
    expect(personalPlaceOfBirth.valid).toBeTruthy();
    expect(numberOfChildren.valid).toBeTruthy();

  });

  describe('addressMobilePhoneNumber and addressPhoneNumber default value', () => {
    beforeEach(() => {
      jest.spyOn(PhoneValidators, 'codeRequired').mockReturnValue(() => null);
      jest.spyOn(PhoneValidators, 'country').mockReturnValue(() => null);
      jest.spyOn(PhoneValidators, 'type').mockReturnValue(() => null);
      jest.spyOn(PhoneValidators, 'parsePhone').mockReturnValue({
        getType: jest.fn().mockReturnValueOnce('MOBILE').mockReturnValueOnce('FIXED_LINE'),
      } as any);
    });

    it('should set empty string', () => {
      const addressMobilePhoneNumber = component.formGroup.get('addressMobilePhoneNumber');
      const addressPhoneNumber = component.formGroup.get('addressPhoneNumber');

      expect(component['flow'].billingAddress.phone).toBeNull();
      expect(component.personType).toEqual(PersonTypeEnum.Customer);
      expect(addressMobilePhoneNumber.value).toEqual('');
      expect(addressPhoneNumber.value).toEqual('');
    });

    it('should set value from state', () => {
      const phone = '+4915788119940';
      store.dispatch(new SetFlow({
        ...flowWithPaymentOptionsFixture(),
        billingAddress: {
          ...flowWithPaymentOptionsFixture().billingAddress,
          phone,
        },
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(PersonalFormComponent);
      component = fixture.componentInstance;
      const addressMobilePhoneNumber = component.formGroup.get('addressMobilePhoneNumber');
      const addressPhoneNumber = component.formGroup.get('addressPhoneNumber');

      expect(component['flow'].billingAddress.phone).toEqual(phone);
      expect(component.personType).toEqual(PersonTypeEnum.Customer);
      expect(addressMobilePhoneNumber.value).toEqual(phone);
      expect(addressPhoneNumber.value).toEqual(phone);
    });
  });

  it('should isPhoneTypeMatches return true', () => {
    const phoneNumber = '+4915788119940';
    const type = 'MOBILE';
    const parsePhone = jest.spyOn(PhoneValidators, 'parsePhone').mockReturnValue({
      getType: jest.fn().mockReturnValue(type),
    } as any);
    expect(component['isPhoneTypeMatches'](phoneNumber, type)).toEqual(true);
    expect(parsePhone).toHaveBeenCalledWith(phoneNumber);
  });

  it('should set addressResidentSince in the form group', () => {
    const datepicker = {
      close: jest.fn(),
    } as unknown as jest.Mocked<MatDatepicker<unknown>>;

    const date = new Date('2024-02-19');
    const dateWithDay = new Date(date.getFullYear(), date.getMonth(), new Date().getDay());

    component.selectAddressResidentSince(date, datepicker);

    expect(datepicker.close).toHaveBeenCalled();
    expect(component.formGroup.get('addressResidentSince').value).toEqual(dateWithDay);
  });

  it('should numberMask perform correctly', () => {
    expect(component.numberMask('+12345ascd!!?%')).toEqual('12345');
    expect(component.numberMask('')).toEqual('');
  });

  it('should togglePrevAddressForm on init', () => {
    const togglePrevAddressEmit = jest.spyOn(component.togglePrevAddress, 'emit');
    const date = new Date(1999, 1, 1);
    component.ngOnInit();
    formGroup.get('addressResidentSince').setValue(date);
    expect(togglePrevAddressEmit).toHaveBeenCalledWith({ date, isPrevAddress: false });
  });

  it('should togglePrevAddressForm emit isPrevAddress false', fakeAsync(() => {
    fixture.detectChanges();
    const togglePrevAddressEmit = jest.spyOn(component.togglePrevAddress, 'emit');
    const date = dayjs().subtract(3, 'years').subtract(1, 'month').toDate();
    component.ngOnInit();
    formGroup.get('addressResidentSince').setValue(date);
    tick();
    expect(togglePrevAddressEmit).toHaveBeenCalledWith({ date, isPrevAddress: false });
  }));

  it('should togglePrevAddressForm emit isPrevAddress true', fakeAsync(() => {
    fixture.detectChanges();
    const togglePrevAddressEmit = jest.spyOn(component.togglePrevAddress, 'emit');
    const date = dayjs().subtract(3, 'years').toDate();
    component.ngOnInit();
    formGroup.get('addressResidentSince').setValue(date);
    tick();
    expect(togglePrevAddressEmit).toHaveBeenCalledWith({ date, isPrevAddress: true });
  }));

  it('should toggleNumberOfChildren enable numberOfChildren on init', () => {
    store.dispatch(new PatchFormState({
      detailsForm: {
        typeOfGuarantorRelation: GuarantorRelation.OTHER_HOUSEHOLD,
      },
    }));
    component.personType = PersonTypeEnum.Guarantor;
    component.ngOnInit();
    expect(formGroup.get('numberOfChildren').enabled).toBeTruthy();
  });

  it('should toggleNumberOfChildren disable numberOfChildren on init', () => {
    store.dispatch(new PatchFormState({
      detailsForm: {
        typeOfGuarantorRelation: GuarantorRelation.EQUIVALENT_HOUSEHOLD,
      },
    }));
    component.personType = PersonTypeEnum.Guarantor;
    component.ngOnInit();
    expect(formGroup.get('numberOfChildren').disabled).toBeTruthy();
  });

  it('should handle numberOfChildrenValueChanges$ on init', () => {
    component.ngOnInit();
    component.formGroup.get('numberOfChildren').setValue('test' as any);
    expect(component.formGroup.get('numberOfChildren').value).toEqual(0);
  });

});
