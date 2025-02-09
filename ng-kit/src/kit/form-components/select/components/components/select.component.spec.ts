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
import { LANG, TranslateService, TranslateStubService } from '../../../../../i18n';
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
class SelectFormComponent extends FormAbstractComponent<any> {
  formScheme: FormScheme = {
    fieldsets: {
      selectFieldset: [
        {
          name: 'selectTest',
          type: 'select',
          fieldSettings: {
            classList: 'col-xs-2',
            label: 'Select field',
            required: true
          },
          selectSettings: {
            options: [
              { label: 'First option', value: 1 },
              { label: 'Second option', value: 2 }
            ],
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

describe('SelectFormComponent', () => {
  let component: SelectFormComponent;
  let fixture: ComponentFixture<SelectFormComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      SelectFormComponent
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
      }
    ]
  });

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SelectFormComponent);
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
