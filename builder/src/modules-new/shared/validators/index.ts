import { AbstractControl, ValidatorFn } from '@angular/forms';

export const notEqualValidation = (valueGetter: string | (() => string)): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = typeof valueGetter === 'string' ? valueGetter : valueGetter();

    return control.value === value ? { notEqual: { value: control.value } } : null;
  };
};

export const notInValidation = (valueGetter: string[] | (() => string[])): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const array = typeof valueGetter === 'function' ? valueGetter() : valueGetter;

    return array.includes(control.value) ? { notIn: { value: control.value } } : null;
  };
};
