import { ChangeDetectionStrategy, Component, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { CountryCode } from 'libphonenumber-js';
import { BehaviorSubject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { PhoneValidators, phoneMask } from '@pe/checkout/forms/phone';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface, FlowStateEnum, PaymentMethodEnum } from '@pe/checkout/types';

import { DetailsFormValue } from '../../../shared';

const COUNTRY_CODE: { [key: string]: CountryCode } = {
  [PaymentMethodEnum.ZINIA_INSTALLMENT_DE]: 'DE',
  [PaymentMethodEnum.ZINIA_POS_INSTALLMENT_DE]: 'DE',
  [PaymentMethodEnum.ZINIA_INSTALLMENT]: 'NL',
  [PaymentMethodEnum.ZINIA_POS_INSTALLMENT]: 'NL',
};

@Component({
  selector: 'details-form',
  templateUrl: './details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsFormComponent extends CompositeForm<DetailsFormValue> implements OnInit {
  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod: PaymentMethodEnum;

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

  override ngOnInit(): void {
    super.ngOnInit();
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot
    );

    this.formGroup.get('phone').addValidators(
      PhoneValidators.country(COUNTRY_CODE[this.paymentMethod], $localize`:@@payment-zinia-installments.inquiry.form.phone.label:`)
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
