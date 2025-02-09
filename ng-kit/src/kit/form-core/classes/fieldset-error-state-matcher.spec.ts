import { FieldsetErrorStateMatcher } from './fieldset-error-state-matcher';
import { FormControl, FormGroupDirective, Validators, FormControlName, ControlContainer, FormGroup } from '@angular/forms';

interface PseudoForm {
  submitted: boolean;
}

describe('FieldsetErrorStateMatcher', () => {
  let matcher: FieldsetErrorStateMatcher;

  beforeEach(() => {
    matcher = new FieldsetErrorStateMatcher();
  });

  it('should check for null values', () => {
    expect(matcher.isErrorState(null, null)).toBeFalsy();
    expect(matcher.isErrorState(new FormControl(), null)).toBeFalsy();
    expect(matcher.isErrorState(null, new FormGroupDirective([], []))).toBeFalsy();
    expect(matcher.isErrorState(new FormControl(), new FormGroupDirective([], []))).toBeFalsy();
  });

  it('should check errors for invalid control without form', () => {
    const control: FormControl = new FormControl(null, Validators.required);
    expect(matcher.isErrorState(control, null)).toBeFalsy();

    control.markAsTouched();
    expect(matcher.isErrorState(control, null)).toBeFalsy();

    matcher.submitted = true;
    expect(matcher.isErrorState(control, null)).toBeTruthy();

    control.markAsUntouched();
    expect(matcher.isErrorState(control, null)).toBeFalsy();
  });

  it('should check errors for invalid control withing pseudo-form', () => {
    const control: FormControl = new FormControl(null, Validators.required);
    const form: PseudoForm = {
      submitted: false
    };
    expect(matcher.isErrorState(control, form as any)).toBeFalsy();

    control.markAsTouched();
    expect(matcher.isErrorState(control, form as any)).toBeFalsy();

    form.submitted = true;
    expect(matcher.isErrorState(control, form as any)).toBeTruthy();

    control.markAsUntouched();
    expect(matcher.isErrorState(control, form as any)).toBeFalsy();
  });
});
