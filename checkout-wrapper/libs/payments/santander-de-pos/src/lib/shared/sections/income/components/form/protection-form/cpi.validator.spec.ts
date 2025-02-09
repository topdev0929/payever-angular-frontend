import { FormControl, FormGroup } from '@angular/forms';

import { cpiValidator } from './cpi.validator';

describe('cpiValidator', () => {

  it('should return { required: true } when both _yes and _no are false', () => {

    const form = new FormGroup({
      _yes: new FormControl(false),
      _no: new FormControl(false),
    });

    expect(cpiValidator(form)).toEqual({ required: true });

  });

  it('should return false when either _yes or _no is true', () => {

    const formYes = new FormGroup({
      _yes: new FormControl(true),
      _no: new FormControl(false),
    });

    const formNo = new FormGroup({
      _yes: new FormControl(false),
      _no: new FormControl(true),
    });

    expect(cpiValidator(formYes)).toBe(false);
    expect(cpiValidator(formNo)).toBe(false);

  });

  it('should return false when both _yes and _no are true', () => {

    const form = new FormGroup({
      _yes: new FormControl(true),
      _no: new FormControl(true),
    });

    expect(cpiValidator(form)).toBe(false);

  });

});
