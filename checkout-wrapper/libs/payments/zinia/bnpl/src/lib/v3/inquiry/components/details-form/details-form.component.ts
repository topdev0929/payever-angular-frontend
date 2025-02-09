import { ChangeDetectionStrategy, Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { filter, map, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { phoneMask } from '@pe/checkout/forms/phone';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { DetailsFormValue } from '../../../models';

@Component({
  selector: 'details-form',
  templateUrl: './details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsFormComponent extends CompositeForm<DetailsFormValue> implements OnInit {
  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  private submit$ = this.injector.get(PaymentSubmissionService);

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Output() submitted = this.submit$.pipe(
    tap(() => {
      this.formGroupDirective.onSubmit(null);
    }),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value),
  );

  public readonly formGroup = this.fb.group({
    birthday: [null, RequiredDate],
    phone: [null, [Validators.required]],
  });

  public readonly adultDateConstraints = DateConstraints.adultDateOfBirth;

  public readonly phoneMask = phoneMask;

  ngOnInit(): void {
    super.ngOnInit();
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot
    );

    this.flow.apiCall?.birthDate && this.formGroup.get('birthday').disable();
    this.flow.billingAddress?.phone && this.formGroup.get('phone').disable();
  }
}
