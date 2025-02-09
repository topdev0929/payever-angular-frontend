import { FormGroup } from '@angular/forms';

export const cpiValidator = (form: FormGroup) => {
  const { _yes, _no } = form.value;

  return !_yes && !_no
    ? { required: true }
    : false;
};
