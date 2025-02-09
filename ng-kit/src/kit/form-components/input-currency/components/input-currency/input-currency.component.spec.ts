import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
/*
import { FormModule } from '../../../../form.module';
import { FormAbstractComponent } from '../../../form-abstract';
import { FormScheme } from '../../../../interfaces';
import { AddonStyle, AddonType, ErrorBag } from '../../../../index';
import { LANG, TranslateService, TranslateStubService, THOUSANDS_SEPARATOR_SYMBOL, DECIMAL_SYMBOL } from '../../../../../i18n';
import { nonRecompilableTestModuleHelper } from '../../../../test';

@Component({
  template: `
    <form novalidate (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
      <pe-form-fieldset
        [translationScope]="formTranslationsScope"
        [isSubmitted]="isSubmitted"
        [fields]="inputCurrencyFieldset"
        [errors]="errors$ | async"
        [formGroup]="form">
      </pe-form-fieldset>
    </form>`
})
class InputCurrencyFormComponent extends FormAbstractComponent<any> {
  formScheme: FormScheme = {
    fieldsets: {
      inputCurrencyFieldset: [
        {
          name: 'inputCurrencyTest',
          type: 'input-currency',
          fieldSettings: {
            classList: 'col-xs-12 col-sm-4',
            required: true
          },
          addonAppend: {
            addonType: AddonType.Text,
            addonStyle: AddonStyle.Filled,
            text: 'USD'
          },
          inputCurrencySettings: {
            maxLength: 6
          }
        },
      ]
    }
  };
  formTranslationsScope: 'test_fieldset.form';
  inputCurrencyFieldset: any;
  protected formStorageKey: string = 'test_fieldset.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
  ) {
    super(injector);
  }

  getErrorBag(): ErrorBag {
    return this.errorBag;
  }

  onUpdateFormData(): void {
    // stub method
  }

  onSuccess(): void {
    // stub method
  }

  protected createForm(): void {
    this.form = this.formBuilder.group({
      inputCurrencyTest: [null, Validators.required]
    });

    this.inputCurrencyFieldset = this.formScheme.fieldsets['inputCurrencyFieldset'];
    this.changeDetectorRef.detectChanges();
  }

}

describe('InputCurrencyFormComponent', () => {
  let component: InputCurrencyFormComponent;
  let fixture: ComponentFixture<InputCurrencyFormComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      InputCurrencyFormComponent
    ],
    imports: [
      FormModule,
      BrowserAnimationsModule
    ],
    providers: [
      {
        provide: LANG,
        useValue: 'en'
      },
      {
        provide: TranslateService, useValue: new TranslateStubService()
      },
      {
        provide: THOUSANDS_SEPARATOR_SYMBOL,
        useValue: ','
      },
      {
        provide: DECIMAL_SYMBOL,
        useValue: '.'
      }
    ]
  });

  beforeEach(async(() => {
    fixture = TestBed.createComponent(InputCurrencyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('createForm()', () => {
    it('Should create input-currency', () => {
      expect(component.form).toBeTruthy();
      expect(fixture.nativeElement.querySelector('pe-input-currency')).toBeTruthy();
    });
  });

  describe('render', () => {
    it('Should render in form-fieldset class', () => {
      expect(fixture.nativeElement.querySelector('.form-fieldset')).toBeTruthy();
    });
  });

  describe('validator', () => {
    it('Should max length validation equal 6', () => {
      const maxLength: string = fixture.nativeElement.querySelector('[ng-reflect-max-length]')
                                  .getAttribute('ng-reflect-max-length');
      expect(maxLength).toEqual('6');
    });
  });

  describe('onSubmit()', () => {
    it('Should be valid with comma and dot like [999,999.99]', () => {
      component.form.controls.inputCurrencyTest.setValue('999999.99');
      fixture.detectChanges();
      const inputValue: string = fixture.nativeElement.querySelector('pe-input-currency input').value;
      expect(inputValue.indexOf(',')).toEqual(3);
      expect(inputValue.indexOf('.')).toBeGreaterThan(4);
      component.onSubmit();
      expect(component.form.controls.inputCurrencyTest.valid).toBeTruthy();
    });

    it('Should be invalid without value', () => {
      component.form.controls.inputCurrencyTest.setValue(null);
      component.onSubmit();
      expect(component.form.controls.inputCurrencyTest.valid).toBeFalsy();
    });

    it('Should append mat-error if invalid', () => {
      component.form.controls.inputCurrencyTest.setValue(null);
      component.onSubmit();
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector('.mat-error')).toBeTruthy();
    });
  });

  describe('External errors', () => {
    it('Should be visible', () => {
      component.form.controls.inputCurrencyTest.setValue('999999.99');
      component.onSubmit();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.mat-error')).toBeFalsy();
      component.getErrorBag().setErrors({inputCurrencyTest: 'Some error'});
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.mat-error')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.mat-error').textContent).toContain('Some error');
    });
  });
});*/
