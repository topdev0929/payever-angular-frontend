import { ChangeDetectionStrategy, Component, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { PhoneValidators, phoneMask } from '@pe/checkout/forms/phone';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, FlowStateEnum } from '@pe/checkout/types';

import { FormOptions } from '../../../../shared';
import { DetailsFormValue } from '../../../models';

@Component({
  selector: 'details-form',
  templateUrl: './details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsFormComponent extends CompositeForm<DetailsFormValue> implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  @SelectSnapshot(PaymentState.options)
  private readonly options!: FormOptions;

  private submit$ = this.injector.get(PaymentSubmissionService);

  public readonly phoneDisabled$ = new BehaviorSubject(false);
  public readonly birthdayDisabled$ = new BehaviorSubject(false);

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
    const phoneLabel = $localize `:@@payment-openbank.inquiry.form.phone.label:`;

    this.options?.phoneCountry && this.formGroup.get('phone').setValidators([
      Validators.required,
      PhoneValidators.country(this.options.phoneCountry, phoneLabel),
      PhoneValidators.type('MOBILE', this.options.phoneCountry, phoneLabel),
    ]);

    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot
    );

    this.flow.apiCall?.birthDate
      && this.birthdayDisabled$.next(this.checkAndDisableControl(this.formGroup.get('birthday')));
    this.flow.billingAddress?.phone
      && this.phoneDisabled$.next(this.checkAndDisableControl(this.formGroup.get('phone')));
  }

  private checkAndDisableControl(control: AbstractControl): boolean {
    control.markAllAsTouched();
    control.updateValueAndValidity();

    return control.valid && this.flow.state !== FlowStateEnum.FINISH;
  }
}
