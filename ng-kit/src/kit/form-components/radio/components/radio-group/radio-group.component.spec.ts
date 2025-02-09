import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
/*
import { FormModule } from '../../../../form.module';
import { FormAbstractComponent } from '../../../form-abstract';
import { FormScheme } from '../../../../interfaces';
import { ErrorBag } from '../../../../index';
import { LANG, TranslateService, TranslateStubService } from '../../../../../i18n';
import { nonRecompilableTestModuleHelper } from '../../../../test';

@Component({
  template: `
    <form novalidate (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
      <pe-form-fieldset
        [translationScope]="formTranslationsScope"
        [isSubmitted]="isSubmitted"
        [fields]="radioGroupFieldset"
        [errors]="errors$ | async"
        [formGroup]="form">
      </pe-form-fieldset>
    </form>`
})
class RadioGroupFormComponent extends FormAbstractComponent<any> {
  formScheme: FormScheme = {
    fieldsets: {
      radioGroupFieldset: [
        {
          name: 'radioGroupTest',
          type: 'radio',
          fieldSettings: {
            classList: 'col-xs-6',
            required: true
          },
          radioSettings: {
            radioButtons: [
              {title: 'First', value: 1},
              {title: 'Second', value: 2},
              {title: 'Third', value: 3}
            ]
          }
        }
      ]
    }
  };
  formTranslationsScope: 'test_fieldset.form';
  radioGroupFieldset: any;
  protected formStorageKey: string = 'test_fieldset.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
  ) {
    super(injector);
  }

  onUpdateFormData(): void {
    // stub method
  }

  onSuccess(): void {
    // stub method
  }

  onFormInvalid(): void {
    // stub method
  }

  protected createForm(): void {
    this.form = this.formBuilder.group({
      radioGroupTest: [null, Validators.required]
    });

    this.radioGroupFieldset = this.formScheme.fieldsets['radioGroupFieldset'];
    this.changeDetectorRef.detectChanges();
  }
}

describe('RadioGroupFormComponent', () => {
  let component: RadioGroupFormComponent;
  let fixture: ComponentFixture<RadioGroupFormComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      RadioGroupFormComponent
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
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioGroupFormComponent);
    component = fixture.componentInstance;
  });

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('createForm()', () => {
    it('Should create radio-group', () => {
      fixture.detectChanges();
      expect(component.form).toBeTruthy();
      expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeTruthy();
    });

    it('Should render in form-fieldset class', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.form-fieldset')).toBeTruthy();
    });

    it('Should be greater inputs then 1', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.mat-radio-input').length).toBeGreaterThan(1);
    });
  });

  describe('[required]', () => {
    it('Should be required', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[required]')).toBeTruthy();
    });
  });

  describe('onSubmit()', () => {
    it('Should not submit without choosed radio', () => {
      fixture.detectChanges();
      component.onSubmit();
      expect(component.form.controls.radioGroupTest.valid).toBeFalsy();
    });

    it('Should submit with choosed radio', () => {
      fixture.detectChanges();
      component.form.controls.radioGroupTest.setValue(1);
      component.onSubmit();
      expect(component.form.controls.radioGroupTest.valid).toBeTruthy();
    });
  });
});*/
