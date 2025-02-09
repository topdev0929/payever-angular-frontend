import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { CompositeForm } from '@pe/checkout/forms';
import { PhoneValidators } from '@pe/checkout/forms/phone';
import { FlowState } from '@pe/checkout/store';
import { AddressInterface } from '@pe/checkout/types';

import { SsnFormValue } from '../../../shared';

import { createSsnValidator } from './ssn.validator';

@Component({
  selector: 'ssn-form',
  templateUrl: './ssn-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsnFormComponent extends CompositeForm<SsnFormValue> {

  @SelectSnapshot(FlowState.address) private address: AddressInterface;

  public readonly formGroup = this.fb.group({
    socialSecurityNumber: this.fb.control<string>(null, [Validators.required, createSsnValidator()]),
    phone: this.fb.control<string>(null, [
      Validators.required,
      PhoneValidators.codeRequired('SE'),
      PhoneValidators.country('SE', $localize`:@@santander-se.inquiry.form.phone_number.label:`),
    ]),
  });

  writeValue(obj: SsnFormValue): void {
    this.formGroup.patchValue({
      phone: this.address?.phone,
      ...obj,
    });
  }
}
