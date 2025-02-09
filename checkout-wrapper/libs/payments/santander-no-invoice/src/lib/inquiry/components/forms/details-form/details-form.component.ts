import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { PhoneValidators } from '@pe/checkout/forms/phone';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { FormRatesMainInterface } from '../../../../shared';

import { validatePostNumber, validateSsn } from './validators';

export interface DetailsFormInterface {
  socialSecurityNumber: string;
  registeredPostNumber: string;
  telephoneMobile: string;
}

@Component({
  selector: 'santander-no-invoice-details-form',
  templateUrl: './details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class DetailsFormComponent extends CompositeForm<DetailsFormInterface> implements OnInit {
  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  private store = this.injector.get(Store);
  private initialValue: FormRatesMainInterface = this.store
    .selectSnapshot(PaymentState.form)
    ?.formDetails || {};

  public formGroup = this.fb.group({
    socialSecurityNumber: [this.initialValue.socialSecurityNumber, [Validators.required, validateSsn]],
    registeredPostNumber: [this.initialValue.registeredPostNumber, [Validators.required, validatePostNumber]],
    telephoneMobile: [this.initialValue.telephoneMobile || this.flow.billingAddress?.phone,
      [
        Validators.required,
        PhoneValidators.country('NO', $localize`:@@santander-no-invoice.inquiry.form.telephone_mobile.label:`),
        PhoneValidators.codeRequired('NO'),
      ],
    ],
  });

  ngOnInit(): void {
    super.ngOnInit();

    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.store.dispatch(new PatchFormState({ formDetails: value }));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
