import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';

import { CompositeForm } from '@pe/checkout/forms';

import { ConfirmFormValue } from '../../../../shared';

@Component({
  selector: 'confirm-form',
  templateUrl: './confirm-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmFormComponent extends CompositeForm<ConfirmFormValue> {

  public readonly formGroup = this.fb.group({
    applyOnBehalfOfOther: [true, Validators.requiredTrue],
    confirmEnteredData: [false, Validators.requiredTrue],
    _agreeObtainCreditStatus: [false, Validators.requiredTrue],
  });

  public readonly translations = {
    _agreeObtainCreditStatus: {
      label: $localize`:@@santander-dk.inquiry.form.agree_obtain_credit_status.label:`,
    },
    agreeText: $localize`:@@santander-dk.inquiry.step.agree_text:`,
    applyOnBehalfOfOther: {
      label: $localize`:@@santander-dk.inquiry.form.apply_on_behalf_of_other.label:`,
    },
    confirmEnteredData: {
      label: $localize`:@@santander-dk.inquiry.form.confirm_entered_data.label:`,
    },
  };
}
