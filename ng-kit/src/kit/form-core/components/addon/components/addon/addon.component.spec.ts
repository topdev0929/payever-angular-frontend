import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
/*
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { FormModule } from '../../../form.module';
import { FormAbstractComponent } from '../../form-abstract';
import { FormScheme } from '../../../interfaces';
import { AddonStyle, AddonType, ErrorBag } from '../../../../index';
import { LANG, TranslateService, TranslateStubService } from '../../../../i18n';

@Component({
  template: `
    <form novalidate (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
      <pe-form-fieldset
        [translationScope]="formTranslationsScope"
        [isSubmitted]="isSubmitted"
        [fields]="addonFieldset"
        [errors]="errors$ | async"
        [formGroup]="form">
      </pe-form-fieldset>
    </form>`
})
class AddonFormComponent extends FormAbstractComponent<any> {
  formScheme: FormScheme = {
    fieldsets: {
      addonFieldset: [
        {
          name: 'addonTest',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-4 col-sm-4'
          },
          addonAppend: {
            addonType: AddonType.Text,
            addonStyle: AddonStyle.Filled,
            text: 'R'
          },
          addonPrepend: {
            addonType: AddonType.Text,
            addonStyle: AddonStyle.Filled,
            text: 'L'
          },
          inputSettings: {
            placeholder: 'Input placeholder'
          }
        }
      ]
    }
  };
  formTranslationsScope: 'test_fieldset.form';
  addonFieldset: any;
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
      addonTest: [null, Validators.required]
    });

    this.addonFieldset = this.formScheme.fieldsets['addonFieldset'];
    this.changeDetectorRef.detectChanges();
  }
}

describe('AddonFormComponent', () => {
  let component: AddonFormComponent;
  let fixture: ComponentFixture<AddonFormComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      AddonFormComponent
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

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddonFormComponent);
    component = fixture.componentInstance;
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('createForm()', () => {
    it('Should create addon "append"', () => {
      fixture.detectChanges();
      expect(component.form).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[matprefix]')).toBeTruthy();
    });

    it('Should create addon "prepend"', () => {
      fixture.detectChanges();
      expect(component.form).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[matsuffix]')).toBeTruthy();
    });

    it('Should render in form-fieldset class', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.form-fieldset')).toBeTruthy();
    });
  });
});
*/
