import { Input, Injector, OnInit, AfterViewInit, ViewChild, Directive } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';

import { peVariables } from '../../../pe-variables';
import { NoopFnType } from '../../types';
import { AbstractFieldComponent } from '../abstract-field';
import { FormAddonComponent } from '../../components/addon/components/addon/addon.component';

const noop: NoopFnType = () => void 0;

@Directive()
export abstract class AbstractValueAccessorFieldComponent extends AbstractFieldComponent implements OnInit, AfterViewInit {

  @Input() set touched(state: boolean) {
    if (state) {
      this.formControl.markAsTouched();
    } else {
      this.formControl.markAsUntouched();
    }
  }
  @ViewChild('addonPrependElem') addonPrependComponent: FormAddonComponent;

  // For QA
  get controlQaId(): string {
    return `control.${AbstractFieldComponent.getFullControlName(this.ngControl.control)}`;
  }

  get addonPrependOffset(): number {
    return this.addonPrependComponent && this.addonPrependComponent.widthPx ? (this.addonPrependComponent.widthPx + parseFloat(peVariables['gridUnitX'] as string)) : 0;
  }

  formControl: FormControl = new FormControl();

  protected ngControl: NgControl;

  // Template methods
  protected onTouchedCallback: NoopFnType = noop;
  protected onChangeCallback: NoopFnType = noop;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.syncErrors();
  }

  onFocus(evt: FocusEvent): void {
    super.onFocus(evt);
    this.onTouchedCallback();
    this.syncErrors();
  }

  // ControlValueAccessor implementation

  writeValue(value: any): void {
    this.formControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: NoopFnType): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: NoopFnType): void {
    this.onTouchedCallback = fn;
  }

  // Methods implementation

  protected onControlChange(value: any): void {
    this.onChangeCallback(value);
    this.syncErrors();
  }

  protected syncErrors(): void {
    if (this.ngControl && this.ngControl.control) {
      this.formControl.setErrors(this.ngControl.control.errors);
    }
  }

}
