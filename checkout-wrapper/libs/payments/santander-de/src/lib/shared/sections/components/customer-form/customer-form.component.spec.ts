import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepicker } from '@angular/material/datepicker';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { AddressAutocompleteService } from '@pe/checkout/forms/address-autocomplete';
import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { AddressInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { flowWithPaymentOptionsFixture, formOptionsInstallmentFixture } from '../../../../test';
import { EmploymentChoice, GuarantorRelation, PERSON_TYPE, PersonTypeEnum } from '../../../types';

import { CustomerFormComponent } from './customer-form.component';

type SortedCountries = Array<{
  label: string;
  value: string;
}>;

describe('CustomerFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: CustomerFormComponent;
  let fixture: ComponentFixture<CustomerFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutUiTooltipModule,
        MatAutocompleteModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressAutocompleteService,
        NgControl,
        {
          provide: PERSON_TYPE,
          useValue: PersonTypeEnum.Customer,
        },
        {
          provide: ApiService, useValue: {
            _patchFlow: jest.fn().mockImplementation((_, data) => of(data)),
          },
        },
      ],
      declarations: [
        CustomerFormComponent,
      ],
    }).compileComponents();
    createComponent();
  });

  const createComponent = (amount=1000) => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow({
      ...flowWithPaymentOptionsFixture(),
      amount,
    }));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          formOptions: formOptionsInstallmentFixture,
        },
      },
    }));

    fixture = TestBed.createComponent(CustomerFormComponent);
    component = fixture.componentInstance;
  };


  afterEach(() => {
    jest.clearAllMocks();
    fixture.destroy();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('prevAddressForm', () => {
    it('should initialize prevAddressForm with expected controls', () => {
      const prevAddressForm = component['prevAddressForm'];

      expect(prevAddressForm.get('_prevAddressLine')).toBeTruthy();
      expect(prevAddressForm.get('prevAddressCity')).toBeTruthy();
      expect(prevAddressForm.get('prevAddressCountry')).toBeTruthy();
      expect(prevAddressForm.get('prevAddressStreet')).toBeTruthy();
      expect(prevAddressForm.get('prevAddressStreetNumber')).toBeTruthy();
      expect(prevAddressForm.get('prevAddressZip')).toBeTruthy();
      expect(prevAddressForm.get('prevAddressResidentSince')).toBeTruthy();
    });

    it('should check validators', () => {
      const prevAddressForm = component['prevAddressForm'];

      const _prevAddressLineControl = prevAddressForm.get('_prevAddressLine');
      const prevAddressCityControl = prevAddressForm.get('prevAddressCity');
      const prevAddressCountryControl = prevAddressForm.get('prevAddressCountry');
      const prevAddressStreet = prevAddressForm.get('prevAddressStreet');
      const prevAddressStreetNumberControl = prevAddressForm.get('prevAddressStreetNumber');
      const prevAddressZipControl = prevAddressForm.get('prevAddressZip');
      const prevAddressResidentSinceControl = prevAddressForm.get('prevAddressResidentSince');

      expect(_prevAddressLineControl.validator).toEqual(Validators.required);
      expect(prevAddressCityControl.validator).toEqual(Validators.required);
      expect(prevAddressCountryControl.validator).toEqual(Validators.required);
      expect(prevAddressStreetNumberControl.validator).toEqual(Validators.required);
      expect(prevAddressStreet.validator).toEqual(Validators.required);
      prevAddressForm.enable();

      prevAddressForm.patchValue({
        prevAddressZip: '0',
        prevAddressResidentSince: null,
      });
      expect(prevAddressForm.valid).toBe(false);
      expect(prevAddressForm.valid).toBe(false);
      expect(prevAddressZipControl.errors).toMatchObject({ zipCodeInvalid: true });
      expect(prevAddressResidentSinceControl.errors).toMatchObject({ required: true });
    });
  });

  describe('formGroup', () => {
    it('should update addressLandlinePhone and addressCellPhone validity based on user input', () => {
      component.formGroup.get('addressLandlinePhone').setValue('+4985012345');
      component.formGroup.get('addressCellPhone').setValue('+41123465');

      expect(component.formGroup.get('addressLandlinePhone').valid).toBe(true);
      expect(component.formGroup.get('addressCellPhone').valid).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should disable prevAddress form', () => {
      const currentDate = new Date();
      const date = new Date(currentDate.getFullYear() - 3, currentDate.getMonth() - 2, currentDate.getDay());

      component.formGroup.get('addressResidentSince').patchValue(date);
      fixture.detectChanges();
      expect(component.formGroup.get('prevAddress').disabled).toBeTruthy();
    });

    it('should enabled prevAddress form', () => {
      const currentDate = new Date();
      const date = new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), currentDate.getDay());

      component.formGroup.get('addressResidentSince').setValue(date);
      fixture.detectChanges();
      expect(component.formGroup.get('prevAddress').enabled).toBeTruthy();
    });

    it('should toggle phone required validators based on addressCellPhone and addressLandlinePhone values', () => {
      const addressCellPhoneControl = component.formGroup.get('addressCellPhone');
      const addressLandlinePhoneControl = component.formGroup.get('addressLandlinePhone');

      addressCellPhoneControl.setValue('+4985012345');
      expect(addressLandlinePhoneControl.hasError('required')).toBeFalsy();
    });
  });

  describe('selectAddressResidentSince', () => {
    it('should update addressResidentSince control and close datepicker', () => {
      const mockDatepicker: MatDatepicker<any> = {
        close: jest.fn(),
      } as any;

      const currentDate = new Date();
      const expectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), new Date().getDay());

      component.selectAddressResidentSince(currentDate, mockDatepicker);

      const actualDate = component.formGroup.get('addressResidentSince').value;

      expect(actualDate).toEqual(expectedDate);

      expect(mockDatepicker.close).toHaveBeenCalled();
    });
  });

  describe('prevAddressResidentSince', () => {
    it('should update prevAddressResidentSince control and close datepicker', () => {
      const mockDatepicker: MatDatepicker<any> = {
        close: jest.fn(),
      } as any;

      const currentDate = new Date();
      const expectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), new Date().getDay());

      component.selectPrevAddressResidentSince(currentDate, mockDatepicker);

      const actualDate = component['prevAddressForm'].get('prevAddressResidentSince').value;

      expect(actualDate).toEqual(expectedDate);

      expect(mockDatepicker.close).toHaveBeenCalled();
    });
  });

  describe('togglePrevAddress$', () => {
    it('should disable prevAddress form', () => {
      const date = dayjs().subtract(3, 'years').subtract(1, 'month').toDate();
      component.ngOnInit();
      component.formGroup.get('addressResidentSince').setValue(date);
      expect(component.formGroup.get('prevAddress').disabled).toBeTruthy();
    });

    it('should enabled prevAddress form', () => {
      const date = dayjs().subtract(3, 'years').toDate();
      component.ngOnInit();
      component.formGroup.get('addressResidentSince').setValue(date);
      expect(component.formGroup.get('prevAddress').enabled).toBeTruthy();
    });
  });

  describe('prevAddressResidentSince', () => {
    it('should parse full address with street information', () => {
      const address: AddressInterface = {
        street: 'Main St',
        streetName: 'Main',
        streetNumber: '123',
        city: 'City',
        country: 'Country',
        zipCode: '12345',
      };

      const countriesOptions: SortedCountries = [
        { label: 'Country', value: 'Country' },
      ];

      const result = component.parseFullAddress(address, countriesOptions);

      expect(result).toBe('Main St, City, 12345, Country');
    });

    it('should parse full address without street information', () => {
      const address: AddressInterface = {
        city: 'City',
        country: 'Country',
        zipCode: '12345',
      };

      const countriesOptions: SortedCountries = [
        { label: 'Country', value: 'Country' },
      ];

      const result = component.parseFullAddress(address, countriesOptions);

      expect(result).toBe('City, 12345, Country');
    });

    it('should handle missing country label in countriesOptions', () => {
      const address: AddressInterface = {
        street: 'Main St',
        city: 'City',
        country: 'Country',
        zipCode: '12345',
      };

      const countriesOptions: SortedCountries = [
        { label: 'Other Country', value: 'OtherCountry' },
      ];

      const result = component.parseFullAddress(address, countriesOptions);

      expect(result).toBe('Main St, City, 12345, Country');
    });

    it('should handle missing country in countriesOptions', () => {
      const address: AddressInterface = {
        street: 'Main St',
        city: 'City',
        country: 'Country',
        zipCode: '12345',
      };

      const countriesOptions: SortedCountries = [
        { label: 'Other Country', value: 'OtherCountry' },
      ];

      const result = component.parseFullAddress(address, countriesOptions);

      expect(result).toBe('Main St, City, 12345, Country');
    });

    it('should handle missing street information', () => {
      const address: AddressInterface = {
        city: 'City',
        country: 'Country',
        zipCode: '12345',
      };

      const countriesOptions: SortedCountries = [
        { label: 'Country', value: 'Country' },
      ];

      const result = component.parseFullAddress(address, countriesOptions);

      expect(result).toBe('City, 12345, Country');
    });
  });

  describe('prevAddressResidentSince', () => {

    it('should patch prevAddressForm with provided address values', () => {
      const mockAddress: AddressInterface = {
        city: 'NewCity',
        country: 'NewCountry',
        streetName: 'NewStreet',
        streetNumber: 'streetNumber',
        zipCode: 'NewZipCode',
      };

      const prevAddressForm = component['prevAddressForm'];

      component.prevAddressChange(mockAddress);

      const afterPatchingFormValue = prevAddressForm.value;

      expect(afterPatchingFormValue).toMatchObject({
        prevAddressCity: mockAddress.city,
        prevAddressCountry: mockAddress.country,
        prevAddressStreet: mockAddress.streetName,
        prevAddressStreetNumber: mockAddress.streetNumber,
        prevAddressZip: mockAddress.zipCode,
        prevAddressResidentSince: null,
      });
    });

  });

  describe('typeOfGuarantorRelation', () => {
    it('should no errors on typeOfGuarantorRelation - HOUSEWIFE_HOMEMAKER =< 2k', () => {
      createComponent(2_000);

      expect(component['flow'].amount).toEqual(2_000);

      component.formGroup.patchValue({
        employment: EmploymentChoice.HOUSEWIFE_HOMEMAKER,
        typeOfGuarantorRelation: GuarantorRelation.NONE,
      });

      expect(component.formGroup.get('typeOfGuarantorRelation').valid).toBe(true);
    });

    it('should show recommend error on typeOfGuarantorRelation - STUDENT > 1.2k', () => {
      createComponent(1_200.01);

      expect(component['flow'].amount).toEqual(1_200.01);

      component.formGroup.patchValue({
        employment: EmploymentChoice.STUDENT,
        typeOfGuarantorRelation: GuarantorRelation.NONE,
      });

      expect(component.formGroup.get('typeOfGuarantorRelation').errors).toMatchObject({
        recommended: 'Second applicant is recommended',
      });
    });

    it('should show recommend error on typeOfGuarantorRelation - HOUSEWIFE_HOMEMAKER > 2k', () => {
      createComponent(2_000.01);

      expect(component['flow'].amount).toEqual(2_000.01);

      component.formGroup.patchValue({
        employment: EmploymentChoice.HOUSEWIFE_HOMEMAKER,
        typeOfGuarantorRelation: GuarantorRelation.NONE,
      });

      expect(component.formGroup.get('typeOfGuarantorRelation').errors).toMatchObject({
        recommended: 'Second applicant is recommended',
      });
    });
  });
});
