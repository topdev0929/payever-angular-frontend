import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
/*
import { FormModule } from '../../../../form.module';
import { FormAbstractComponent } from '../../../form-abstract';
import { FormScheme } from '../../../../interfaces';
import { AddonType, ErrorBag } from '../../../../index';
import { LANG, TranslateService, TranslateStubService, COUNTRY_LIST, COUNTRY_CONTINENT_LIST, CONTINENT_LIST } from '../../../../../i18n';
import { nonRecompilableTestModuleHelper } from '../../../../test';

@Component({
  template: `
    <form novalidate (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
      <pe-form-fieldset
        [translationScope]="formTranslationsScope"
        [isSubmitted]="isSubmitted"
        [fields]="autocompleteFieldset"
        [errors]="errors$ | async"
        [formGroup]="form">
      </pe-form-fieldset>
    </form>`
})
class AutocompleteFormComponent extends FormAbstractComponent<any> {
  formScheme: FormScheme = {
    fieldsets: {
      autocompleteFieldset: [
        {
          name: 'autocompleteGooglePlacesTest',
          type: 'autocomplete-google-places',
          fieldSettings: {
            classList: 'col-xs-12 col-sm-6',
            required: true
          },
          addonPrepend: {
            addonType: AddonType.Icon,
            iconId: 'icon-geocoder-24'
          },
          autocompleteGooglePlacesSettings: {
            placeholder: 'Autocomplete google places placeholder'
          }
        }
      ]
    }
  };
  formTranslationsScope: 'test_fieldset.form';
  autocompleteFieldset: any;
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
      autocompleteGooglePlacesTest: [null, Validators.required]
    });

    this.autocompleteFieldset = this.formScheme.fieldsets['autocompleteFieldset'];
    this.changeDetectorRef.detectChanges();
  }
}

describe('AutocompleteFormComponent', () => {
  let component: AutocompleteFormComponent;
  let fixture: ComponentFixture<AutocompleteFormComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      AutocompleteFormComponent
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
    fixture = TestBed.createComponent(AutocompleteFormComponent);
    component = fixture.componentInstance;
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('createForm()', () => {
    it('Should create autocomplete', () => {
      fixture.detectChanges();
      expect(component.form).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.pe-input')).toBeTruthy();
    });

    it('Should render in form-fieldset class', () => {
      fixture.detectChanges();
      const fieldsetEl: HTMLElement = fixture.nativeElement.querySelector('.form-fieldset');
      expect(fieldsetEl).toBeTruthy();
    });
  });

  describe('onSubmit()', () => {
    it('Should not submit without value', () => {
      fixture.detectChanges();
      component.form.controls.autocompleteGooglePlacesTest.setValue(null);
      component.onSubmit();
      expect(component.form.controls.autocompleteGooglePlacesTest.valid).toBeFalsy();
    });

    it('Should submit with selected value', () => {
      fixture.detectChanges();
      component.form.controls.autocompleteGooglePlacesTest.setValue(1);
      component.onSubmit();
      expect(component.form.controls.autocompleteGooglePlacesTest.valid).toBeTruthy();
    });

    it('Should append mat-error if invalid', () => {
      fixture.detectChanges();
      component.form.controls.autocompleteGooglePlacesTest.setValue(null);
      component.onSubmit();
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector('.mat-error')).toBeTruthy();
    });
  });
});*/
