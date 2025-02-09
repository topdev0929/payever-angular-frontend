import { ChangeDetectionStrategy, Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { filter, map, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { PhoneValidators, phoneMask } from '@pe/checkout/forms/phone';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { ALLOWED_COUNTRIES } from '../../../settings';

export interface DetailsFormValue {
  phone: string;
}

@Component({
  selector: 'details-form',
  templateUrl: './details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsFormComponent extends CompositeForm<DetailsFormValue> implements OnInit {
  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod!: PaymentMethodEnum;

  public readonly phoneMask = phoneMask;
  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  private submit$ = this.injector.get(PaymentSubmissionService);

  @Output() submitted = this.submit$.pipe(
    tap(() => {
      this.formGroupDirective.onSubmit(null);
    }),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value),
  );

  public readonly formGroup = this.fb.group({
    phone: [
      null,
      [
        Validators.required,
        PhoneValidators.codeRequired(ALLOWED_COUNTRIES[this.paymentMethod]),
        PhoneValidators.country(ALLOWED_COUNTRIES[this.paymentMethod], $localize`:@@swedbank.inquiry.form.phone.label:`),
      ],
    ],
  });
}
