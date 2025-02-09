import { takeUntil } from 'rxjs/operators';
import { Input, Output, Injector, AfterViewInit, EventEmitter, OnDestroy, Directive } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormArray } from '@angular/forms';
import { Subject, MonoTypeOperatorFunction } from 'rxjs';

import { ErrorStateMatcherInterface } from '../../interfaces';
import { AddonInterface, AddonPrependStyle, AddonStyle } from '../addon';
import { AddonType } from '../addon/enums';

@Directive()
export abstract class AbstractFieldComponent implements OnDestroy, AfterViewInit {

  formControl: FormControl;

  @Input() addonAppend: AddonInterface;
  @Input() addonPrepend: AddonInterface;
  @Input('errorMessage') set setErrorMessage(errorMessage: string) {
    this.errorMessage = errorMessage;
    this.syncErrors();
  }
  @Input() errorStateMatcher: ErrorStateMatcherInterface;
  @Input('formControlRef') set setFormControl(formControl: FormControl) {
    this.formControl = formControl;
    this.onSetFormControl();
  }
  @Input() required: boolean;
  @Input() readonly: boolean;
  @Input() scopeQaId: string = null;
  @Input() tabIndex: number = null;
  @Input() blockCopyPaste: boolean = false;

  @Input() set disabled(disabled: boolean) {
    if (this.formControl) {
      if (disabled && !this.formControl.disabled) {
        this.formControl.disable();
      } else if (this.formControl.disabled) {
        this.formControl.enable();
      }
    }
  }
  get disabled(): boolean {
    return this.formControl ?
      this.formControl.disabled :
      false;
  }

  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  @Output() focus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output() blur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  readonly floatLabel: string = 'auto';
  hideRequiredMarker: boolean = true;

  errorMessage: string;

  protected destroyed$: Subject<boolean> = new Subject();
  protected isFocused: boolean;

  get isErrorState(): boolean {
    return this.errorStateMatcher &&
      this.formControl &&
      this.errorStateMatcher.isErrorState(this.formControl, null) ||
      false;
  }

  get isAddonStyleFilled(): boolean {
    return this.addonAppend ?
      this.addonAppend.addonStyle === AddonStyle.Filled :
      false;
  }

  // For QA
  get controlQaId(): string {
    return this.formControl ?
      `control.${
        this.scopeQaId ? `${this.scopeQaId}.` : ''
        }${
        AbstractFieldComponent.getFullControlName(this.formControl)
        }` :
      '';
  }

  get hasAddonAppend(): boolean {
    return this.addonAppend ?
      Boolean(
        this.addonAppend.addonType === AddonType.Loader ||
        this.addonAppend.iconId ||
        this.addonAppend.text
      ) :
      false;
  }

  get hasAddonPrepend(): boolean {
    return !this.hasAddonInlinePrepend && this.addonPrepend ?
      Boolean(
        this.addonPrepend.addonType === AddonType.Loader ||
        this.addonPrepend.iconId ||
        this.addonPrepend.text
      ) :
      false;
  }

  get hasAddonInlinePrepend(): boolean {
    return Boolean(
      this.addonPrepend &&
      this.addonPrepend.addonPrependStyle === AddonPrependStyle.Inline &&
      this.addonPrepend.text &&
      (this.isFocused || this.formControl.value)
    );
  }

  constructor(
    protected injector: Injector
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  takeUntilDestroyed<T = any>(): MonoTypeOperatorFunction<T> {
    return takeUntil(this.destroyed$);
  }

  ngAfterViewInit(): void {
    // handling situation when input was disabled before form control
    this.disabled = this.disabled;
  }

  onFocus(evt: FocusEvent): void {
    this.isFocused = true;
    this.markAsUntouched();
    this.focus.emit(evt);
  }

  onBlur(evt: FocusEvent): void {
    this.isFocused = false;
    this.blur.emit(evt);
  }

  protected syncErrors(): void {
    // Must be implemented in inherited component if component has own control.setErrors() call
    return;
  }

  protected markAsUntouched(): void {
    this.formControl.markAsUntouched();
  }

  protected onSetFormControl(): void {
    return;
  }

  static getFullControlName(formControl: AbstractControl | FormGroup, postfix: string = ''): string {
    let name: string = '';

    const parent: FormGroup | FormArray = formControl && formControl.parent || null;
    if (parent) {
      name = Object.keys(parent.controls)
        .find(key => parent.get(key) === formControl);

      if (parent.parent) {
        name = this.getFullControlName(formControl.parent as FormGroup, `.${name}`);
      }
    }

    return name + postfix;
  }
}
