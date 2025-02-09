import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Injector } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
/*
import { FormModule } from '../../../../form.module';
import { AddonStyle, AddonType } from '../../../..';
import { LANG, TranslateStubService } from '../../../../../i18n';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { AbstractFieldComponent } from '../../../abstract-field';
import { AddonInterface } from '../../../addon/interfaces';
import { FormControl } from '@angular/forms';

@Component({
  template: `
    <input matInput
           type="text"
           (blur)="onBlur($event)"
           (focus)="onFocus($event)">
    <mat-label *ngIf="label">{{label}}</mat-label>
    <mat-error *ngIf="errorMessage && formControl.invalid">{{errorMessage}}</mat-error>
    <pe-form-addon matSuffix [addon]="addonAppend" *ngIf="hasAddonAppend"></pe-form-addon>
    <pe-form-addon matPrefix [addon]="addonPrepend" *ngIf="hasAddonPrepend"></pe-form-addon>
  `,
})
class InputHostComponent extends AbstractFieldComponent {
  formControl: FormControl = new FormControl();

  addonAppend: AddonInterface = {
    addonType: AddonType.Text,
    addonStyle: AddonStyle.Filled,
    text: 'USD'
  };

  addonPrepend: AddonInterface = {
    addonType: AddonType.Text,
    addonStyle: AddonStyle.Filled,
    text: 'EUR'
  };

  constructor(protected injector: Injector) {
    super(injector);
  }
}

describe('InputComponent', () => {
  let component: InputHostComponent;
  let fixture: ComponentFixture<InputHostComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      InputHostComponent,
    ],
    imports: [
      FormModule,
      BrowserAnimationsModule,
      MatOptionModule,
      MatSelectModule,
    ],
    providers: [
      { provide: LANG, useValue: 'en' },
      TranslateStubService.provide(),
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputHostComponent);
    component = fixture.componentInstance;
  });

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy();
    });

    it('Should return true hasAddonAppend() hasAddonPrepend() isAddonStyleFilled', () => {
      fixture.detectChanges();
      expect(component.hasAddonAppend).toBeTruthy();
      expect(component.hasAddonPrepend).toBeTruthy();
      expect(component.isAddonStyleFilled).toBeTruthy();
    });

    it('Should return controlQaId()', () => {
      fixture.detectChanges();
      expect(component.controlQaId).toBeTruthy();
    });

    it('Should have ngOnDestroy()', () => {
      expect(component.ngOnDestroy).toBeTruthy();
    });
  });
});*/
