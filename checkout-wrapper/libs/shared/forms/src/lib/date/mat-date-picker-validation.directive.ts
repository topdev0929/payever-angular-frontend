// related to this issue:
// https://github.com/angular/components/issues/16761
// can be removed after this issue is resolved.

import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  NgControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';


export interface AbstractControlWithElementRef extends AbstractControl {
  elementRef: ElementRef;
}


@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: `
    input[matDatepicker]input[formControlName],
    input[matDatepicker]input[formControl],
  `,
})
export class PeMatDatePickerValidationTool implements OnInit {
  constructor(
    protected elementRef: ElementRef,
    private ngControl: NgControl,
  ) { }

  @HostListener('dateInput', ['$event.target'])
  dateInput() {
    this.ngControl.control.updateValueAndValidity();
  }

  
  ngOnInit(): void {
    const control = this.ngControl.control as AbstractControlWithElementRef;
    control.elementRef = this.elementRef;
    this.ngControl.control.updateValueAndValidity();
  }

  public static wrapValidators(...validators: ValidatorFn[]): ValidatorFn[] {
    return validators.map(validator => (control: AbstractControl) => {
      const controlWithElementRef = control as AbstractControlWithElementRef;
      const value = controlWithElementRef.elementRef?.nativeElement?.value;
      
      return value && !control.value
        ? { pattern: true }
        : validator(new FormControl(value));
    });
  }
}

export const RequiredDate = PeMatDatePickerValidationTool.wrapValidators(
  Validators.required,
);