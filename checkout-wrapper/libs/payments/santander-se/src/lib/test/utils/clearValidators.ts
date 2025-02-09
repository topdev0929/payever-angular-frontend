import { AbstractControl, FormGroup } from '@angular/forms';

export const clearValidators = (formGroup: FormGroup) => {
    _clearValidators(formGroup);
    Object.values(formGroup.controls).forEach((control: AbstractControl) => {
        _clearValidators(control);
        (control as FormGroup).controls && clearValidators(control as FormGroup);
    });
};

const _clearValidators = (control: AbstractControl) => {
    control.clearValidators();
    control.clearAsyncValidators();
    control.updateValueAndValidity();
};