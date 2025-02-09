import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
/*
import { FormModule } from '../../../../form.module';
import { FormAbstractComponent } from '../../../form-abstract';
import { FormScheme } from '../../../../interfaces';
import { HttpClientModule } from '@angular/common/http';
import { ErrorBag } from '../../../../index';
import { CONTINENT_LIST, COUNTRY_CONTINENT_LIST, COUNTRY_LIST, LANG, TranslateService, TranslateStubService } from '../../../../../i18n';
import { nonRecompilableTestModuleHelper } from '../../../../test';

@Component({
  template: `
    <form novalidate (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
      <pe-form-fieldset
        [translationScope]="formTranslationsScope"
        [isSubmitted]="isSubmitted"
        [fields]="selectFieldset"
        [errors]="errors$ | async"
        [formGroup]="form">
      </pe-form-fieldset>
    </form>`
})
class SelectCountryFormComponent extends FormAbstractComponent<any> {
  formScheme: FormScheme = {
    fieldsets: {
      selectFieldset: [
        {
          name: 'selectTest',
          type: 'select-country',
          fieldSettings: {
            classList: 'col-xs-2',
            label: 'Select field',
            required: true
          },
          selectCountrySettings: {
            placeholder: 'Select placeholder'
          }
        },
      ]
    }
  };
  formTranslationsScope: 'test_fieldset.form';
  selectFieldset: any;
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

  protected createForm(): void {
    this.form = this.formBuilder.group({
      selectTest: [null, Validators.required]
    });

    this.selectFieldset = this.formScheme.fieldsets['selectFieldset'];
    this.changeDetectorRef.detectChanges();
  }
}

describe('SelectCountryFormComponent', () => {
  let component: SelectCountryFormComponent;
  let fixture: ComponentFixture<SelectCountryFormComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      SelectCountryFormComponent
    ],
    imports: [
      HttpClientModule,
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
        provide: COUNTRY_LIST, useValue: {AF: 'Afghanistan'}
      },
      {
        provide: CONTINENT_LIST, useValue: [{
          code: 'AS',
          name: 'Asia'
        }]
      },
      {
        provide: COUNTRY_CONTINENT_LIST, useValue: {AF: 'AS'}
      },
    ]
  });

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SelectCountryFormComponent);
    component = fixture.componentInstance;
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('createForm()', () => {
    it('Should create select', () => {
      fixture.detectChanges();
      expect(component.form).toBeTruthy();
    });

    it('Should render in form-fieldset class', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.form-fieldset')).toBeTruthy();
    });

    it('Should have required status', () => {
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector('[required]')).toBeTruthy();
    });
  });

  describe('onSubmit()', () => {
    it('Should not submit without selected value', () => {
      fixture.detectChanges();
      component.form.controls.selectTest.setValue(null);
      component.onSubmit();
      expect(component.form.controls.selectTest.valid).toBeFalsy();
    });

    it('Should submit with selected value', () => {
      fixture.detectChanges();
      component.form.controls.selectTest.setValue(1);
      component.onSubmit();
      expect(component.form.controls.selectTest.valid).toBeTruthy();
    });

    it('Should append mat-error if invalid', () => {
      fixture.detectChanges();
      component.form.controls.selectTest.setValue(null);
      component.onSubmit();
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector('.mat-error')).toBeTruthy();
    });
  });
});*/
