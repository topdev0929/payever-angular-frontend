import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { PhoneValidators, phoneMask } from '@pe/checkout/forms/phone';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { SALUTATION_OPTIONS } from './salutation-options.constant';

interface InfoFormInterface {
  birthday: string;
  phone: string;
}

@Component({
  selector: 'personal-form',
  templateUrl: './personal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalFormComponent extends CompositeForm<InfoFormInterface> implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  public formGroup = this.fb.group({
    birthday: this.fb.control<string>(null, RequiredDate),
    phone: this.fb.control<string>(
      null,
      [
        Validators.required,
        PhoneValidators.country('DE', $localize`:@@santander-de-invoice.inquiry.form.phone.label:`),
      ],
    ),
    salutation: this.fb.control<string>({ disabled: !this.showSalutation, value: null }, [Validators.required]),
    _firstName: this.fb.control<string>({ disabled: true, value: null }),
    _lastName: this.fb.control<string>({ disabled: true, value: null }),
  });

  public readonly pastDateConstraints = DateConstraints.adultDateOfBirth;
  public readonly salutationOptions = SALUTATION_OPTIONS;
  public phoneMask = phoneMask;

  public get showSalutation(): boolean {
    return !this.flow.hideSalutation
      && !this.flow.billingAddress?.salutation
      && !this.flow.apiCall?.salutation;
  }

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot
    );
    super.ngOnInit();
  }

  writeValue(obj: InfoFormInterface): void {
    this.formGroup.patchValue(obj);

    obj && Object.entries(obj).forEach(([key, value]) => {
      value && this.formGroup.get(key).disable();
    });
  }
}
