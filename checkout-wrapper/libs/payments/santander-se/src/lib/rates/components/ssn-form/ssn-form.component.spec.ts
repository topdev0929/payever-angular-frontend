import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { PhoneValidators } from '@pe/checkout/forms/phone';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import {
  SsnFormValue,
} from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';

import { SsnFormComponent } from './ssn-form.component';
import * as ssnValidation from './ssn.validator';


describe('ssn-form', () => {
  let component: SsnFormComponent;
  let fixture: ComponentFixture<SsnFormComponent>;
  let store: Store;
  let ssnForm: FormControl<SsnFormValue>;
  let debugElement: HTMLElement;
  let phoneInput: HTMLInputElement;
  let ssnInput: HTMLInputElement;
  let createSsnValidatorSpy: jest.SpyInstance;
  let countrySpy: jest.SpyInstance;
  let codeRequiredSpy: jest.SpyInstance;

  beforeEach(() => {
    createSsnValidatorSpy = jest.spyOn(ssnValidation, 'createSsnValidator');
    countrySpy = jest.spyOn(PhoneValidators, 'country');
    codeRequiredSpy = jest.spyOn(PhoneValidators, 'codeRequired');
    const fb = new FormBuilder();
    ssnForm = fb.control<SsnFormValue>(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: ssnForm,
        },
      ],
      declarations: [
        SsnFormComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(SsnFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
    debugElement = fixture.debugElement.nativeElement;
    phoneInput = debugElement.querySelector('input[formControlName="phone"]');
    ssnInput = debugElement.querySelector('input[formControlName="socialSecurityNumber"]');
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('form', () => {
    it('should render form', () => {
      expect(debugElement.querySelector('form')).toBeTruthy();
    });

    it('should grab phone from store', () => {
      component.writeValue(null);

      expect(phoneInput.value).toBe('+46731298952');
    });

    it('should handle phone null in store', () => {
      jest.spyOn(component as any, 'address', 'get').mockReturnValue(undefined);
      component.writeValue(null);
      expect(phoneInput.value).toBe('');
    });

    it('should writeValue update values', () => {
      const formValues = {
        socialSecurityNumber: '111111-1111',
        phone: '+46731298953',
      };
      component.writeValue(formValues);

      expect(component.formGroup.value).toMatchObject(formValues);
    });

    it('phone and ssn should be required', () => {
      phoneInput.value = '';
      ssnInput.value = '';
      phoneInput.dispatchEvent(new Event('input'));
      ssnInput.dispatchEvent(new Event('input'));

      expect(component.formGroup.get('phone').errors).toEqual({ required: true });
      expect(component.formGroup.get('socialSecurityNumber').errors).toEqual({ required: true });
    });

    it('should use ssnValidator', () => {
      expect(createSsnValidatorSpy).toHaveBeenCalled();
    });

    it('phone should accept only se numbers with countryCode required', () => {
      expect(codeRequiredSpy).toBeCalledWith('SE');
      expect(countrySpy).toBeCalledWith('SE', expect.any(String));
    });
  });
});

