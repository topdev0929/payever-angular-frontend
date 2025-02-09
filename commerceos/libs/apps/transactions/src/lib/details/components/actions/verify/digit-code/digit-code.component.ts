import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { AbstractVerifyAction } from '../verify-action.abstract';

@Component({
  selector: 'pe-verify-action-digit-code',
  templateUrl: './digit-code.component.html',
  styleUrls: ['./digit-code.component.scss'],
})

export class ActionVerifyDigitCodeComponent extends AbstractVerifyAction {
  errorKeyValue = 'transactions.action-errors.verify.digit_code';

  onSubmit(): void {
    this.form.updateValueAndValidity();
    this.isSubmitted = true;

    if (this.form.invalid) {
      return;
    }

    this.verifyService.done({
      data: this.form.get(this.field.name).value,
      dataKey: this.field.name,
    });
  }

  createForm(): void {
    this.form = new FormGroup({
      [this.field.name]: new FormControl(null, this.field.validators),
    });
  }
}
