import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Component, Injector, DebugElement } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { nonRecompilableTestModuleHelper } from '../../../../test';/*
import { FormModule } from '../../../../form.module';
import { FormAbstractComponent } from '../../../form-abstract';
import { phoneInputValidator, PhoneInputValidationErrorInterface } from '../../validators';
import { FormScheme, FormSchemeField } from '../../../../interfaces';
import { LANG, TranslateStubService } from '../../../../../i18n';
import { ErrorBag } from '../../../../services';
import { PhoneInputComponent } from './phone-input.component';

interface PhoneInputDataInterface {
  phone: string;
}

// All form fields should be tested via test form component
@Component({
  template: `<form novalidate (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
    <pe-form-fieldset
      [translationScope]="formTranslationsScope"
      [isSubmitted]="isSubmitted"
      [fields]="formScheme.fieldsets[fieldsetName]"
      [errors]="errors$ | async"
      [formGroup]="form">
    </pe-form-fieldset>
  </form>`
})
class PhoneInputFormComponent extends FormAbstractComponent<PhoneInputDataInterface> {

  fieldsetName: string = 'mainTestFieldset';
  formStorageKey: string = 'test.PhoneInputFormComponent';
  formTranslationsScope: string = 'test.PhoneInputFormComponent.formTranslationsScope';

  fieldset: FormSchemeField[] = [
    {
      name: 'phone',
      type: 'phone-input'
    },
    {
      // NOTE: country is nessessary for `phoneInputValidator(component.form.get('county'))`
      name: 'country',
      type: 'input'
    }
  ];

  formScheme: FormScheme = {
    fieldsets: {
      [this.fieldsetName]: this.fieldset
    }
  };

  form: FormGroup = this.formBuilder.group({
    country: ['DE'], // default country for tests
    phone: null
  });

  constructor(
    protected injector: Injector,
    protected errorBag: ErrorBag
  ) {
    super(injector);
  }

  createForm(): void {
    // stub method
  }

  onUpdateFormData(): void {
    // stub method
  }

  onSuccess(): void {
    // stub method
  }
}

describe('PhoneInputComponent', () => {
  let component: PhoneInputFormComponent;
  let fixture: ComponentFixture<PhoneInputFormComponent>;

  const properPhoneNumberGermany: string = '+49 40 32527414';
  const properPhoneNumberSweden: string = '+46 850828508';
  const phoneInputElementCSSSelector: string = '.phone-input';

  nonRecompilableTestModuleHelper({
    declarations: [PhoneInputFormComponent],
    imports: [
      NoopAnimationsModule,
      FormModule
    ],
    providers: [
      { provide: LANG, useValue: 'en' },
      TranslateStubService.provide()
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneInputFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('should create component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should render PhoneInputComponent', () => {
      const phoneInputElement: DebugElement = fixture.debugElement.query(By.css('pe-phone-input'));
      expect(phoneInputElement).not.toBeNull();
      const phoneInput: PhoneInputComponent = phoneInputElement.componentInstance;
      expect(phoneInput instanceof PhoneInputComponent).toBeTruthy('PhoneInputComponent should be rendered');
    });
  });

  describe('Validate PhoneInput', () => {
    let phoneInputControl: AbstractControl;
    let countryInputControl: AbstractControl;
    let phoneInputElement: HTMLInputElement;

    beforeEach(async(() => {
      fixture.whenStable().then(() => {
        phoneInputControl = component.form.get('phone');
        countryInputControl = component.form.get('country');
        phoneInputElement = fixture.debugElement.query(By.css(phoneInputElementCSSSelector)).nativeElement;
      });
    }));

    describe('without phoneInputValidator', () => {
      it('should render HTMLInputElement of PhoneInputComponent', () => {
        expect(phoneInputElement).not.toBeNull();
        expect(phoneInputElement instanceof HTMLInputElement).toBeTruthy('should find HTMLInputElement');
      });

      it('should be valid by default without validators', () => {
        expect(phoneInputControl.valid).toBeTruthy('PhoneInput should be valid by default (without Validator.required or same)');
        expect(phoneInputControl.pristine).toBeTruthy('PhoneInput should be untouched by default');
      });

      it('should remove all invalid characters on input', async () => {
        const badValue: string = '123kljasdf4567890-+_)(*&^%$#!@#$%^&*9';
        const goodValue: string = '1234567890-+)(9';
        expect(goodValue).not.toBe(badValue, 'Protect test bad changes');
        expect(phoneInputControl.value).toBeNull('Initial value should be empty');

        phoneInputElement.value = badValue;
        phoneInputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(phoneInputControl.value).toBe(goodValue, 'All bad characters should be removed from value on input');
      });

      it('should remove all duplicated characters and trim() on input (on paste)', async () => {
        const badValue: string = '   +++123  --- (((234))) -- 02938094-23-4---234   ';
        const goodValue: string = '+123-(234)-02938094-23-4-234';
        expect(goodValue).not.toBe(badValue, 'Protect test bad changes');
        expect(phoneInputControl.value).toBeNull('Initial value should be empty');

        phoneInputElement.value = badValue;
        phoneInputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(phoneInputControl.value).toBe(goodValue, 'All bad characters should be removed from value on input');
      });

      it('should remove all duplicated characters and trim() on input (on type)', async () => {
        const badValue: string = '   +++123  --- (((234))) -- 02938094-23-4---234   ';
        const goodValue: string = '+123-(234)-02938094-23-4-234';
        expect(goodValue).not.toBe(badValue, 'Protect test bad changes');
        expect(phoneInputControl.value).toBeNull('Initial value should be empty');

        badValue.split('').forEach(symbol => {
          phoneInputElement.value += symbol;
          phoneInputElement.dispatchEvent(new Event('input'));
          fixture.detectChanges();
        });

        expect(phoneInputControl.value).toBe(goodValue, 'All bad characters should be removed from value on input');
      });
    });

    describe('within Validators.required', () => {
      it('should be invalid when value empty', () => {
        phoneInputControl.setValue('');
        expect(phoneInputControl.valid).toBeTruthy('PhoneInput should be valid initially');

        phoneInputControl.setValidators([Validators.required]);
        phoneInputControl.updateValueAndValidity();
        fixture.detectChanges();
        expect(phoneInputControl.valid).toBeFalsy('PhoneInput should NOT be valid');
      });

      it('should work together with phoneInputValidator', () => {
        phoneInputControl.setValue('');
        phoneInputControl.setValidators([Validators.required, phoneInputValidator({countryControl: countryInputControl})]);
        phoneInputControl.updateValueAndValidity();
        fixture.detectChanges();
        expect(phoneInputControl.valid).toBeFalsy('PhoneInput should NOT be valid');
        expect(phoneInputControl.errors).toEqual({ required: true });
      });

      it('should apply when empty', () => {
        phoneInputControl.setValue('');
        phoneInputControl.setValidators([phoneInputValidator({countryControl: countryInputControl})]);
        phoneInputControl.updateValueAndValidity();
        fixture.detectChanges();
        expect(phoneInputControl.valid).toBeTruthy('PhoneInput should be valid');
      });
    });

    describe('within phoneInputValidator', () => {
      beforeEach(() => {
        phoneInputControl.setValidators([phoneInputValidator({countryControl: countryInputControl})]);
        component.form.updateValueAndValidity();
        fixture.detectChanges();
      });

      it('should check broken value via reactive form', () => {
        expect(phoneInputControl.valid).toBeTruthy('Phone Input initially should be valid');

        phoneInputControl.setValue('asdfadf8098989asfdasf');
        component.onSubmit();
        fixture.detectChanges();

        expect(phoneInputControl.valid).toBeFalsy('PhoneInput should NOT be valid after bad input setup');
      });

      it('should check broken value setted via DOM', async(async () => {
        spyOn(component, 'onSuccess');
        spyOn(component, 'onUpdateFormData');

        phoneInputElement.value = 'VERY BR0KEN VALUE 123';
        phoneInputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(component.onUpdateFormData).toHaveBeenCalled();

        component.onSubmit();
        fixture.detectChanges();
        expect(component.onSuccess).not.toHaveBeenCalled();

        expect(component.form.valid).toBeFalsy('Whole form should NOT be valid');
        expect(component.form.errors).toBeFalsy('Whole form should NOT be valid');
        expect(phoneInputControl.valid).toBeFalsy('PhoneInput should be invalid');
        expect(phoneInputControl.errors).not.toBeNull('Errors should be presented');
        const expectingError: PhoneInputValidationErrorInterface = { phone: { valid: false, country: false } };
        expect(phoneInputControl.errors.phone).toEqual(expectingError.phone);
      }));

      it('should require country for validation', () => {
        countryInputControl.setValue('');
        phoneInputControl.setValue(properPhoneNumberGermany);
        expect(phoneInputControl.valid).toBeFalsy('should not be valid');
        expect(phoneInputControl.errors).toEqual({ phone: { country: true, valid: false } }, '"country: true" should be flagged');
      });

      it('should validate Germany number in mobile format', () => {
        countryInputControl.setValue('DE');
        phoneInputControl.setValue(properPhoneNumberGermany);
        expect(phoneInputControl.valid).toBeTruthy(`Germany phone number ${properPhoneNumberGermany} should be valid`);
      });

      it('should validate Sweden number in mobile format', () => {
        countryInputControl.setValue('SV');
        phoneInputControl.setValue(properPhoneNumberSweden);
        expect(phoneInputControl.valid).toBeTruthy(`Sweden phone number ${properPhoneNumberSweden} should be valid`);
      });

      it('should render validation error in DOM', () => {
        phoneInputControl.setValue('[bad Value]');
        expect(phoneInputControl.valid).toBeFalsy('PhoneInput should NOT be valid');

        component.onSubmit();
        fixture.detectChanges();

        const phoneInputError: DebugElement = fixture.debugElement.query(By.css('.phone-input-error'));
        expect(phoneInputError).not.toBeNull('.phone-input-error should be rendered');
        expect(phoneInputError.nativeElement.textContent.trim()).toBe('ng_kit.forms.error.validator.phone', 'Error message should be pseudo-translated');
      });

      it('should not render validation error in DOM for proper value', () => {
        phoneInputControl.setValue(properPhoneNumberGermany);
        expect(phoneInputControl.valid).toBeTruthy('PhoneInput should be valid');

        component.onSubmit();
        fixture.detectChanges();

        const phoneInputError: DebugElement = fixture.debugElement.query(By.css('.phone-input-error'));
        expect(phoneInputError).toBeNull('.phone-input-error should NOT be rendered');
      });
    });
  });
});*/
