import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';

import { CompositeForm } from '@pe/checkout/forms';
import { emailRequiredValidator } from '@pe/checkout/forms/email';

import { GuarantorDetailsFormValue, PERSON_TYPE } from '../../../../shared/types';


@Component({
  selector: 'guarantor-details',
  templateUrl: './guarantor-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuarantorDetailsFormComponent extends CompositeForm<GuarantorDetailsFormValue> {
  public personType = this.injector.get(PERSON_TYPE);

  public readonly formGroup = this.fb.group({
    email: [
      null, emailRequiredValidator,
    ],
    salutation: [null, Validators.required],
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
  });

  public readonly salutationOptions = [
    {
      label: $localize`:@@checkout_address_edit.form.salutation.value.SALUTATION_MR:`,
      value: 'SALUTATION_MR',
    },
    {
      label: $localize`:@@checkout_address_edit.form.salutation.value.SALUTATION_MRS:`,
      value: 'SALUTATION_MRS',
    },
  ];
}
