import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';

import { CompositeForm } from '@pe/checkout/forms';

import { BankDetailsFormValue } from '../../../../shared';

const REGISTRATION_NUMBER_LENGTH = 4;
const ACCOUNT_NUMBER_MIN_LENGTH = 7;
const ACCOUNT_NUMBER_MAX_LENGTH = 11;

@Component({
  selector: 'bank-details-form',
  templateUrl: './bank-details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankDetailsFormComponent extends CompositeForm<BankDetailsFormValue> {

  public formGroup = this.fb.group({
    bankRegistrationNumber: [
      null,
      [
        Validators.required,
        Validators.minLength(REGISTRATION_NUMBER_LENGTH),
        Validators.maxLength(REGISTRATION_NUMBER_LENGTH),
      ],
    ],
    bankAccountNumber: [
      null,
      [
        Validators.required,
        Validators.minLength(ACCOUNT_NUMBER_MIN_LENGTH),
        Validators.maxLength(ACCOUNT_NUMBER_MAX_LENGTH),
      ],
    ],
    eCard: [false],
  });

  public readonly translations = {
    eCard: $localize `:@@santander-dk.inquiry.form.e_card.label:`,
  };

  public readonly registrationNumberMask = (value: string) => value
    ? value.replace(/\D/g, '').slice(0, REGISTRATION_NUMBER_LENGTH)
    : value;

  public readonly accountNumberMask = (value: string) => {
    if (!value) {
      return value;
    }

    return value
      .replace(/\D/g, '')
      .replace(/^(\d{3})(\d+)$/, '$1 $2')
      .slice(0, ACCOUNT_NUMBER_MAX_LENGTH);
  };

  public readonly accountNumberUnmask = (value: string) => value ? value.replace(' ', '') : value;
}
