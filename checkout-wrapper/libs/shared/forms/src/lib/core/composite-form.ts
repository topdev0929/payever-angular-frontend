import { Directive, Injector, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NgControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

@Directive()
export abstract class CompositeForm<FormInterface> implements ControlValueAccessor, OnInit, Validator {

  protected abstract formGroup: FormGroup;

  protected fb = inject(FormBuilder);
  protected destroy$ = inject(PeDestroyService);
  protected ngControl = inject(NgControl, { self: true, optional: true });
  protected injector = inject(Injector);
  protected customElementService = inject(CustomElementService);

  protected onTouch: () => void;

  constructor() {
    if (!this.ngControl) {
      this.ngControl = inject(NgControl, { skipSelf: true });
    }
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.ngControl?.control?.setValidators(this.validate.bind(this));
    this.ngControl?.control?.updateValueAndValidity({ emitEvent: false });
  }

  writeValue(obj: FormInterface): void {
    this.formGroup.patchValue(obj);
  }

  registerOnChange(fn: (value: FormInterface) => void): void {
    this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.value),
      tap((value: FormInterface) => {
        this.onTouch?.();
        fn?.(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  validate(control: AbstractControl): ValidationErrors {
    return this.validateRecursive(this.formGroup);
  }

  private validateRecursive(control: AbstractControl): ValidationErrors {

    if (control instanceof FormGroup || control instanceof FormArray) {
      const controls = Object.values(control.controls);

      return controls.some(c => this.validateRecursive(c)) ? { invalid: true } : control.errors;
    }

    return control.invalid ? { invalid: true } : null;
  }
}
