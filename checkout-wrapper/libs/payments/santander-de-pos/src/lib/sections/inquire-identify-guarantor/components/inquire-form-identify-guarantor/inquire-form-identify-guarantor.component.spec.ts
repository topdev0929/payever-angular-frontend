import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { Store } from '@ngxs/store';

import {
  IdentifyFormValue,
  PERSON_TYPE,
  PersonTypeEnum,
  PersonalFormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { PatchFormState, SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { InquireFormIdentifyGuarantorComponent } from './inquire-form-identify-guarantor.component';

describe('InquireFormIdentifyGuarantorComponent', () => {
  const storeHelper = new StoreHelper();

  let component: InquireFormIdentifyGuarantorComponent;
  let fixture: ComponentFixture<InquireFormIdentifyGuarantorComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        InquireFormIdentifyGuarantorComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: PERSON_TYPE,
          useValue: PersonTypeEnum.Guarantor,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchFormState({
      guarantor: {},
    }));

    fixture = TestBed.createComponent(InquireFormIdentifyGuarantorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });


  describe('Form Submission', () => {
    it('should call formGroupDirective.onSubmit on submit', () => {
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;

      component.submit();

      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
    });

    it('should dispatch PatchFormState and emit submitted event on onSubmit if form is valid', () => {
      const mockValidValue = {
        typeOfIdentification: 'Passport',
        identificationNumber: 'AB123456',
        identificationPlaceOfIssue: 'City',
        identificationDateOfIssue: new Date('2022-01-01'),
        identificationDateOfExpiry: new Date('2025-01-01'),
        identificationIssuingAuthority: 'Government Authority',
        personalDateOfBirth: new Date('1990-05-15'),
        personalNationality: 'Country',
        personalPlaceOfBirth: 'Town',
        personalBirthName: 'John Doe',
        _idPassed: true,
      } as IdentifyFormValue;
      const mockFormValue = { guarantor: { _identifyForm: {} } };
      component.formGroup.patchValue({ _identifyForm: mockValidValue });
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(mockFormValue);
      jest.spyOn(store, 'dispatch');
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(component.submitted.emit).toHaveBeenCalledWith(mockValidValue as PersonalFormValue);
    });

    it('should not dispatch PatchFormState or emit submitted event on onSubmit if form is invalid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(false);
      jest.spyOn(store, 'dispatch');
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(store.dispatch).not.toHaveBeenCalled();
      expect(component.submitted.emit).not.toHaveBeenCalled();
    });
  });
});
