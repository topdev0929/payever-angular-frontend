import { AbstractControl, ValidationErrors } from '@angular/forms';

const MAX_DOMAIN_CHARACTER_LENGTH = 64;
const MAX_PREFIX_CHARACTER_LENGTH = 255;

const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;
const peEmailRegex = /^[^<>()[\]\\,$#!;?*/%{}^=~:\s&@"]+@([\w-]+\.)+\w{2,}$/;

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value;
  if (!val) { return null }

  if (!emailRegex.test(val)) {
    return { email: true };
  }

  const [prefix, domain] = val.split('@');
  if (
    prefix.length >= MAX_DOMAIN_CHARACTER_LENGTH ||
    domain.length >= MAX_PREFIX_CHARACTER_LENGTH ||
    domain.split('.').some(s => s.length >= MAX_DOMAIN_CHARACTER_LENGTH)
  ) {
    return { email: true };
  }

  return peEmailRegex.test(val) ? null : { email: true };
}

export function emailRequiredValidator(control: AbstractControl) {
  return control.value ? emailValidator(control) : { required: true };
}
