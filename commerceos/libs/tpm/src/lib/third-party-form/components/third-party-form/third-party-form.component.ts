import { Component, Injector, Input, Output, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { isEqual, cloneDeep } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FormAbstractComponent, FormSchemeField, FormScheme } from '@pe/forms';
import { FieldSettingsInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import {
  AccordionPanelInterface,
  FieldsetData,
  InfoBoxOperationInterface,
  InfoBoxNestedElementsInterface,
} from '../../interfaces';
import { ConnectSchemeField } from '../third-party-root-form/third-party-root-form.component';

export type DynamicInfoBoxGeneratorFormData = any;

interface ControlsConfigInterface {
  [key: string]: any;
}

interface FieldSettingsInterfaceEx extends FieldSettingsInterface {
  toggleFieldOnChange: string;
}

@Component({
  selector: 'pe-third-party-form',
  exportAs: 'infoBoxGeneratorForm',
  styleUrls: ['./third-party-form.component.scss'],
  templateUrl: './third-party-form.component.html',
})
export class ThirdPartyFormComponent extends FormAbstractComponent<DynamicInfoBoxGeneratorFormData> implements OnInit {

  @Input() operation: InfoBoxOperationInterface;
  @Input() set fieldset(fieldset: FormSchemeField[]) {
    this.formScheme = {
      fieldsets: { fieldset: this.fixFieldsetStyles(fieldset) },
    };

    this.prepareDependenciesData(this.fieldset);
  }

  get fieldset(): FormSchemeField[] {
    return this.formScheme && this.formScheme.fieldsets.fieldset;
  }

  @Input() fieldsetData: DynamicInfoBoxGeneratorFormData;
  @Input() submitOnChange = false;
  @Input() loading: boolean;
  @Input() nestedElements: InfoBoxNestedElementsInterface;
  @Input() isSubmitted: boolean;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change: Subject<DynamicInfoBoxGeneratorFormData> = new Subject();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() submit: Subject<DynamicInfoBoxGeneratorFormData> = new Subject();
  formScheme: FormScheme;
  formStorageKey = 'formStorageKey';
  lastFormValue: any = null;

  dependControlsData = new Map();

  private translateService: TranslateService = this.injector.get(TranslateService);

  constructor(
    injector: Injector,
  ) {
    super(injector);
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(['plus-softy-16', 'minus-softy-16']);
  }

  ngOnInit(): void {
    this.tryInstantiateForm();
  }

  createForm(): void {
    if (this.fieldset) {
      this.fieldset.forEach(({ name, fieldSettings }) => {
        if (fieldSettings) {
          const settings = fieldSettings as FieldSettingsInterfaceEx;
          if (settings && settings.classList && settings.classList.includes('disabled')) {
            this.toggleControl(name, false);
          }
          if (settings && settings.toggleFieldOnChange) {
            this.form.controls[name].valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
              this.toggleControlVisibility(name, value);
            });
          }
        }
      });
    }
  }

  onUpdateFormData(data: unknown): void {
    if (!isEqual(this.lastFormValue, this.form.value)) {
      const firstRun: boolean = this.lastFormValue === null;
      this.lastFormValue = this.form.value;
      if (!firstRun) {
        if (this.submitOnChange) {
          this.submitForm();
        }
        this.change.next(this.form.value as DynamicInfoBoxGeneratorFormData);
      }
    }

    Array.from(this.dependControlsData).forEach(([key, values]) => {
      if (data?.[key]) {
        const value = data[key];

        values.forEach((item) => {
          const enable = item.value === value;
          this.toggleControlSchemeVisibility('fieldset', item.name, enable);
        });
      }
    });
  }

  onSuccess(): void {
    this.submitForm();
  }

  translate(key: string): string {
    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : key;
  }

  private toggleControlSchemeVisibility(fieldset: string, name: string, enable: boolean): void {
    const formScheme = this.formScheme?.fieldsets[fieldset].find(a => a.name === name);

    if (formScheme) {
      let fieldSettings = formScheme.fieldSettings as FieldSettingsInterface;

      if (enable) {
        const cl = fieldSettings.classList;
        fieldSettings.classList = cl.split(' ').filter(a => a !== 'hidden').join(' ');
      } else {
        fieldSettings.classList += ' hidden';
      }

      this.toggleControl(name, enable);
      formScheme.fieldSettings = fieldSettings;
    }
  }

  private submitForm(): void {
    this.submit.next(this.form.value as DynamicInfoBoxGeneratorFormData);
  }

  private tryInstantiateForm(): void {
    if (!this.form && this.fieldset && this.fieldsetData) {
      const nestedElements = this.handleNestedElements();
      this.form = this.formBuilder.group(
        this.normalizeFormScheme([...this.fieldset, ...nestedElements.fieldset], { ...this.fieldsetData, ...nestedElements.fieldsetData })
      );
    }
  }

  private prepareDependenciesData(fieldset: FormSchemeField[]): void {
    fieldset.forEach((field) => {
      const fieldSettings = (field as ConnectSchemeField).fieldSettings;
      if (fieldSettings?.dynamic && fieldSettings?.dependControl && fieldSettings?.dependValue) {
        const newValue = {
          name: field.name,
          value: fieldSettings.dependValue,
        };

        if (this.dependControlsData.has(fieldSettings.dependControl)) {
          const dependFields = this.dependControlsData.get(fieldSettings.dependControl);

          this.dependControlsData.set(fieldSettings.dependControl, [...dependFields, newValue]);
        } else {
          this.dependControlsData.set(fieldSettings.dependControl, [newValue]);
        }
      }
    });
  }

  private normalizeFormScheme(
    fieldset: FormSchemeField[],
    fieldsetData: DynamicInfoBoxGeneratorFormData
  ): ControlsConfigInterface {
    const controlsConfig: ControlsConfigInterface = {};

    fieldset.forEach(({ name, type, fieldSettings }) => {
      controlsConfig[name] = [
        fieldsetData[name],
        (fieldSettings as FieldSettingsInterface).required ?
          [Validators.required] :
          [],
      ];
    });

    return controlsConfig;
  }

  private fixFieldsetStyles(fieldset: FormSchemeField[]): FormSchemeField[] {
    fieldset = cloneDeep(fieldset) || [];
    fieldset.forEach(({ name, type, fieldSettings }) => {
      if (fieldSettings && (fieldSettings as FieldSettingsInterface).classList) {
        (fieldSettings as FieldSettingsInterface).classList += ' form-fieldset-field-padding-24';
      }
      if (type === 'checkbox') {
        (fieldSettings as FieldSettingsInterface).classList += ' connect-checkbox connect-checkbox-nowrap';
      }
    });

    return fieldset;
  }

  private handleNestedElements(): {fieldset: FormSchemeField[], fieldsetData: FieldsetData} {
    const resultObj: {fieldset: FormSchemeField[], fieldsetData: FieldsetData} = { fieldset: [], fieldsetData: {} };

    if (!this.nestedElements) {
      return resultObj;
    }

    for (const prop in this.nestedElements) {
      if (this.nestedElements.hasOwnProperty(prop) && prop === 'accordion') {
        const accordionFormData = this.handleNestedAccordion(this.nestedElements[prop]);
        resultObj.fieldset = [...resultObj.fieldset, ...accordionFormData.fieldset];
        resultObj.fieldsetData = { ...resultObj.fieldsetData, ...accordionFormData.fieldsetData };
      }
    }

    return resultObj;
  }

  private handleNestedAccordion(accordion: AccordionPanelInterface[]): {fieldset: FormSchemeField[], fieldsetData: FieldsetData} {
    let fieldset: FormSchemeField[] = [],
      fieldsetData: FieldsetData = {};

    accordion.forEach((panel) => {
      fieldset = [...fieldset, ...panel.fieldset];
      fieldsetData = { ...fieldsetData, ...panel.fieldsetData };
    });

    return { fieldset, fieldsetData };
  }
}
