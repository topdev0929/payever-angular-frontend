import { Inject, Input, OnDestroy, Directive, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Observable, of, Subject, timer } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { forEach } from 'lodash-es';

import { LANG, TranslateService } from '../../../i18n';
import { FieldsetErrorStateMatcher } from '../../classes';
import {
  BaseFormSchemeField,
  FieldSettingsInterface,
  InputSettingsInterface,
  LinkedControlInterface
} from '../../interfaces';
import { AddonInterface } from '../addon/interfaces';

export interface FieldContextInterface<FormSchemeField> {
  field: FormSchemeField;
  formToken: string;
  paymentFlowId: string;
  label: string;
  placeholder: string;
  tabIndex$: Observable<number>;
  addonAppend$: Observable<AddonInterface>;
  addonPrepend$: Observable<AddonInterface>;
}

interface BaseFormSchemeFieldWithFieldContext<FormSchemeField> extends BaseFormSchemeField {
  _context?: {
    f: FieldContextInterface<FormSchemeField>
  };
}

// providers: [
//   {
//     provide: DateAdapter,
//     useClass: LocaleDateAdapter,
//     deps: [Platform, TransformDateService],
//   }
// ]
@Directive()
export class BaseFormFieldsetComponent<FormSchemeField extends BaseFormSchemeFieldWithFieldContext<FormSchemeField>> implements OnChanges, OnDestroy {

  @Input() set isSubmitted(submitted: boolean) {
    this._submitted = submitted;
    this.errorStateMatcher.submitted = submitted;
  }
  get isSubmitted(): boolean {
    return this._submitted;
  }

  @Input() set fields(fields: FormSchemeField[]) {
    this._fields = fields;
  }
  get fields(): FormSchemeField[] {
    return this._fields;
  }

  @Input() set errors(errors: any) {
    if (!errors) {
      return;
    }
    const fields: string[] = Object.keys(errors);
    for (const field of fields) {
      let control: AbstractControl = null;
      forEach(this.formGroup.controls, (value: any, key: string) => {
        if (this.clearKey(key) === this.clearKey(field)) {
          control = value;
        }
      });
      if (control) {
        control.setErrors({ external: errors[field] });
      }
    }
  }

  @Input() set formGroup(formGroup: FormGroup) {
    this._formGroup = formGroup;
  }
  get formGroup(): FormGroup {
    return this._formGroup;
  }

  @Input() formToken: string;
  @Input() paymentFlowId: string;
  @Input() translationScope: string;
  @Input() hideDisabled: boolean = false;
  @Input() formStyle: 'default' | 'dark' | 'transparent' = 'default';
  @Input() noBorder: boolean = false;
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';
  @Input() noMargin: boolean = false;
  @Input() scopeQaId: string = null;
  @Input() noBorderRadius: boolean = false;
  @Input() fixedDark: boolean = false;

  errorStateMatcher: FieldsetErrorStateMatcher = new FieldsetErrorStateMatcher();

  private _destroyed$: Subject<boolean> = new Subject();
  private _fieldRefreshed$: Subject<boolean> = new Subject();
  private _fields: FormSchemeField[];
  private _submitted: boolean = false;
  private _formGroup: FormGroup;

  constructor(
    private dateAdapter: DateAdapter<Date>,
    @Inject(LANG) private lang: string,
    private translateService: TranslateService
  ) {
    if (lang) {
      this.dateAdapter.setLocale(lang);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] || changes['formGroup']) {
      this._initFields();
      this._initFieldsContext();
    }
    if (changes['translationScope'] || changes['formToken'] || changes['paymentFlowId']) {
      this._initFieldsContext();
    }
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  asObservable<T>(value: T | Observable<T> | null | undefined): Observable<T> {
    return value && value['_isScalar'] !== undefined ?
      (value as Observable<T>) :
      of(value as T);
  }

  getLabelKey(fieldName: string): string {
    return this._getFieldTranslationKey(fieldName, 'label');
  }

  getPlaceholderKey(fieldName: string): string {
    return this._getFieldTranslationKey(fieldName, 'placeholder');
  }

  getPlaceholderOptionalKey(fieldName: string): string {
    return this._getFieldTranslationKey(fieldName, 'placeholder_optional');
  }

  getPlaceholder(field: FormSchemeField): string {
    let customPlaceholder: string;
    if (field.inputSettings) {
      this.asObservable(field.inputSettings).pipe(take(1)).subscribe((settings: InputSettingsInterface) => {
        customPlaceholder = settings.placeholder;
      });
    }
    const key = this.getPlaceholderKey(field.name);
    const placeholder: string = customPlaceholder !== undefined ?
      customPlaceholder :
      (this.translateService.hasTranslation(key) ? this.translateService.translate(key) : key);
    const placeholderOptionalKey: string = this.getPlaceholderOptionalKey(field.name);
    if (this.isFieldRequired(field) || this.isFieldReadonly(field)) {
      return placeholder;
    } else if (this.translateService.hasTranslation(placeholderOptionalKey)) {
      return this.translateService.translate(placeholderOptionalKey);
    } else {
      return `${placeholder} ${this.translateService.translate('ng_kit.forms.optional')}`;
    }
  }

  isFieldsetVisible(): boolean {
    return !this.hideDisabled || (this.fields && this.fields.some((field: FormSchemeField) => this.isFieldVisible(field.name)));
  }

  isFieldVisible(field: string): boolean {
    const control: AbstractControl = this.formGroup ? this.formGroup.get(field) : null;
    return control && (!this.hideDisabled || control.enabled);
  }

  getFieldError(field: FormSchemeField): string {
    return field ? this._getFormFieldError(field, this.getLabel(field)) : null;
  }

  /**
   * Required flag should be explicitly added in field settings
   * because no valid way to get the list of validators in angular
   * and check if required validator is present. It works only when 1 validator on field
   */
  isFieldRequired(field: FormSchemeField): boolean {
    let required: boolean = false;
    this.asObservable(field.fieldSettings).pipe(take(1)).subscribe((fieldSettings: FieldSettingsInterface) => {
      if (fieldSettings && fieldSettings.required) {
        required = fieldSettings.required;
      }
    });
    return required;
  }

  isFieldReadonly(field: FormSchemeField): boolean {
    let required: boolean = false;
    this.asObservable(field.fieldSettings).pipe(take(1)).subscribe((fieldSettings: FieldSettingsInterface) => {
      if (fieldSettings && fieldSettings.readonly) {
        required = fieldSettings.readonly;
      }
    });
    return required;
  }

  isBlockCopyPaste(field: FormSchemeField): boolean {
    let blockCopyPaste: boolean = false;
    this.asObservable(field.fieldSettings).pipe(take(1)).subscribe((fieldSettings: FieldSettingsInterface) => {
      if (fieldSettings && fieldSettings.blockCopyPaste) {
        blockCopyPaste = fieldSettings.blockCopyPaste;
      }
    });
    return blockCopyPaste;
  }

  executeCallback<T>(settings: T | Observable<T>, callbackName: string, ...args: any[]): void {
    this.asObservable(settings).pipe(take(1)).subscribe(evaluatedSettings => {
      if (evaluatedSettings && evaluatedSettings[callbackName]) {
        evaluatedSettings[callbackName](...args);
      }
    });
  }

  handleLabelClick(field: FormSchemeField, event: MouseEvent): void {
    this.asObservable(field.fieldSettings).pipe(take(1)).subscribe((settings: FieldSettingsInterface) => {
      if (settings.labelClicked) {
        settings.labelClicked(event);
      }
    });
  }

  handleValueChange<T>(field: FormSchemeField, value: T | Observable<T>, callbackName?: string, ...args: any[]): void {
    timer(0).pipe(
      takeUntil(this._destroyed$)
    ).subscribe(() => {
      this.executeCallback(value, callbackName, ...args);
    });
  }

  getLabel(field: FormSchemeField): string {
    let label: string;
    if (field.fieldSettings) {
      this.asObservable(field.fieldSettings).pipe(take(1)).subscribe((settings: FieldSettingsInterface) => {
        label = settings.label;
      });
    }
    return label === undefined ? this.translateService.translate(this.getLabelKey(field.name)) : label;
  }

  translate(key: string): string {
    return key && this.translateService.hasTranslation(key) ? this.translateService.translate(key) : key;
  }

  private getFieldContext(field: FormSchemeField): { f: FieldContextInterface<FormSchemeField> } {
    return {
      f: {
        field,
        formToken: this.formToken,
        paymentFlowId: this.paymentFlowId,
        label: this.getLabel(field),
        placeholder: this.getPlaceholder(field),
        tabIndex$: this.asObservable(field.fieldSettings).pipe(map(s => s.tabIndex)),
        addonAppend$: this.asObservable(field.addonAppend),
        addonPrepend$: this.asObservable(field.addonPrepend)
      }
    };
  }

  private _initFields(): void {
    this._fieldRefreshed$.next(true);
    this._fieldRefreshed$.complete();
    this._fieldRefreshed$ = new Subject();

    if (!this.formGroup) {
      return;
    }

    for (const field of this._fields) {
      if (this.formGroup.get(field.name)) {
        this.formGroup.get(field.name).valueChanges
          .pipe(
            takeUntil(this._fieldRefreshed$),
            takeUntil(this._destroyed$)
          )
          .subscribe((value: any) => this._onFieldValueChange(field, value));
      }
    }
  }

  private _initFieldsContext(): void {
    if (this._fields && this._fields.length) {
      for (const field of this._fields) {
        field._context = this.getFieldContext(field);
      }
    }
  }

  private _onFieldValueChange(field: FormSchemeField, value: any): void {
    this._updateLinkedControls(field, value);
  }

  private _updateLinkedControls(field: FormSchemeField, value: any): void {
    if (field.linkedControls) {
      let linkedControls: LinkedControlInterface[];
      this.asObservable(field.linkedControls).pipe(take(1)).subscribe((controls: LinkedControlInterface[]) => {
        linkedControls = controls;
      });

      for (const linkedControl of linkedControls) {
        const control: AbstractControl = typeof linkedControl.control === 'string'
          ? this.formGroup.get(linkedControl.control)
          : linkedControl.control;

        const newControlValue: any = linkedControl.transform
          ? linkedControl.transform(value, linkedControl.propertyName)
          : linkedControl.propertyName && value[linkedControl.propertyName] !== undefined
            ? value[linkedControl.propertyName]
            : value;
        control.setValue(newControlValue, {emitEvent: false});
      }
    }
  }

  private _getFieldTranslationKey(fieldName: string, key: string): string {
    return `${this.translationScope ? `${this.translationScope}.` : ''}${fieldName}.${key}`;
  }

  private _getFormFieldError(field: FormSchemeField, label: string): string {
    const control: AbstractControl = this.formGroup.get(field.name);
    const errors: {} = control && control.errors ? control.errors : {};
    const types: string[] = Object.keys(errors);
    let result: string = null;

    if (types.length) {
      switch (types[0]) {
        case 'required':
          result = this._isToggleField(field)
            ? this.translateService.translate('ng_kit.forms.error.validator.required_full')
            : this.translateService.translate('ng_kit.forms.error.validator.required', { fieldName: label });
          break;
        case 'pattern':
          result = this.translateService.translate('ng_kit.forms.error.validator.pattern', { fieldName: label });
          break;
        case 'expired':
          result = this.translateService.translate('ng_kit.forms.error.validator.expired', { fieldName: label });
          break;
        case 'phone':
          if (errors[types[0]].country) {
            result = this.translateService.translate('ng_kit.forms.error.validator.phone_country', { fieldName: label });
          } else {
            result = this.translateService.translate('ng_kit.forms.error.validator.phone', { fieldName: label });
          }
          break;
        case 'email':
          result = this.translateService.translate('ng_kit.forms.error.validator.email', { fieldName: label });
          break;
        case 'minlength': {
          const observable$: Observable<InputSettingsInterface> = this.getSettingsAsObservable(field.inputSettings);

          observable$.pipe(take(1)).subscribe((settings: InputSettingsInterface) => {
            result = settings && settings.minLength
              ? this.translateService.translate(
                'ng_kit.forms.error.validator.minlength_with_number',
                {fieldName: label, length: settings.minLength}
              )
              : this.translateService.translate('ng_kit.forms.error.validator.minlength', {fieldName: label});
          });
          break;
        }
        case 'maxlength': {
          const observable$: Observable<InputSettingsInterface> = this.getSettingsAsObservable(field.inputSettings);

          observable$.pipe(take(1)).subscribe((settings: InputSettingsInterface) => {
            result = settings && settings.maxLength
              ? this.translateService.translate(
                'ng_kit.forms.error.validator.maxlength_with_number',
                {fieldName: label, length: settings.maxLength}
              )
              : this.translateService.translate('ng_kit.forms.error.validator.maxlength', {fieldName: label});
          });
          break;
        }
        case 'dateRange':
          result = this.translateService.translate('ng_kit.forms.error.validator.date_range', {
            fieldName: label,
            min: this.dateAdapter.format(errors['dateRange'].min, 'input'),
            max: this.dateAdapter.format(errors['dateRange'].max, 'input')
          });
          break;
        case 'matDatepickerMin':
          result = this.translateService.translate('ng_kit.forms.error.validator.datepicker.min', {
            fieldName: label,
            min: this.dateAdapter.format(errors['matDatepickerMin'].min, 'input')
          });
          break;
        case 'matDatepickerMax':
          result = this.translateService.translate('ng_kit.forms.error.validator.datepicker.max', {
            fieldName: label,
            max: this.dateAdapter.format(errors['matDatepickerMax'].max, 'input')
          });
          break;
        case 'external':
        case 'custom':
          result = errors[types[0]];
          if (this.translateService.hasTranslation(result)) {
            result = this.translateService.translate(result, { fieldName: label });
          }
          break;
        case 'match':
          result = this.translateService.translate('ng_kit.forms.error.validator.match');
          break;
        default:
          result = this._isToggleField(field) ?
            this.translateService.translate('ng_kit.forms.error.unknown_error_full') :
            this.translateService.translate('ng_kit.forms.error.unknown_error', { fieldName: label });
      }
    }
    return result;
  }

  private getSettingsAsObservable(settings: InputSettingsInterface | Observable<InputSettingsInterface>): Observable<InputSettingsInterface> {
    let observable$: Observable<InputSettingsInterface> = of(null);

    if (settings) {
      if (settings instanceof Observable) {
        observable$ = settings;
      } else {
        observable$ = of(settings);
      }
    }
    return observable$;
  }

  private _isToggleField(field: FormSchemeField): boolean {
    // TODO This is kind of hack
    const ftype = (field as any).type;
    return ftype === 'checkbox' ||
           ftype === 'radio' ||
           ftype === 'checkbox-array' ||
           ftype === 'slide-toggle' ||
           ftype === 'slider';
  }

  private clearKey(key: string): string {
    // _car_0_type_ -> car_0_type
    return key.split('_').join(' ').trim().split(' ').join('_');
  }

}
