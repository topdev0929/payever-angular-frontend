import { Component, Injector } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Validators } from '@angular/forms';
/*
import { FormModule } from '../../../../form.module';
import { FormAbstractComponent } from '../../../form-abstract';
import { FormScheme } from '../../../../interfaces';
import { ErrorBag } from '../../../../index';
import { LANG, TranslateService, TranslateStubService } from '../../../../../i18n';
import { nonRecompilableTestModuleHelper } from '../../../../test';

interface CheckboxInterface {
  checkboxTest: boolean;
}

@Component({
  template: `
    <form novalidate (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
      <pe-form-fieldset
        [translationScope]="formTranslationsScope"
        [isSubmitted]="isSubmitted"
        [fields]="checkboxFieldset"
        [formGroup]="form">
      </pe-form-fieldset>
    </form>`
})
class CheckboxFormComponent extends FormAbstractComponent<CheckboxInterface> {
  formScheme: FormScheme = {
    fieldsets: {
      checkboxFieldset: [
        {
          name: 'checkboxTest',
          type: 'checkbox',
          fieldSettings: {
            classList: 'col-xs-1',
            required: true
          },
        }
      ]
    }
  };
  formTranslationsScope: 'test_fieldset.form';
  checkboxFieldset: any;
  initialValue: boolean = true;
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
      checkboxTest: [this.initialValue, Validators.required]
    });

    this.checkboxFieldset = this.formScheme.fieldsets['checkboxFieldset'];
    this.changeDetectorRef.detectChanges();
  }
}

describe('CheckboxFormComponent', () => {
  let component: CheckboxFormComponent;
  let fixture: ComponentFixture<CheckboxFormComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      CheckboxFormComponent
    ],
    imports: [
      FormModule
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
    fixture = TestBed.createComponent(CheckboxFormComponent);
    component = fixture.componentInstance;
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('createForm()', () => {
    it('Should create checkbox', () => {
      fixture.detectChanges();
      expect(component.form).toBeTruthy();
    });

    it('Should render in pe-form-fieldset class', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.form-fieldset')).toBeTruthy();
    });

    it('Should have required status', () => {
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector('[required]')).toBeTruthy();
    });
  });

  describe('submitForm()', () => {
    it('Should not submit with not checked value', () => {
      fixture.detectChanges();
      component.form.controls.checkboxTest.setValue(false);
      component.onSubmit();
      expect(component.form.controls.checkboxTest.valid).toBeFalsy();
    });

    it('Should submit with checked value', () => {
      fixture.detectChanges();
      component.form.controls.checkboxTest.setValue(true);
      component.onSubmit();
      expect(component.form.controls.checkboxTest.valid).toBeTruthy();
    });
  });
});*/
