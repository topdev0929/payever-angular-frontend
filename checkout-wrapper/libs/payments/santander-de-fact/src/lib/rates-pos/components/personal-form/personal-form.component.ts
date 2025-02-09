import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { CompositeForm } from '@pe/checkout/forms';
import { DateConstraints, RequiredDate } from '@pe/checkout/forms/date';
import { PhoneValidators, phoneMask } from '@pe/checkout/forms/phone';

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

  public formGroup = this.fb.group({
    birthday: this.fb.control<string>(null, RequiredDate),
    phone: this.fb.control<string>(
      null,
      [
        Validators.required,
        PhoneValidators.country('DE', $localize`:@@santander-de-invoice.inquiry.form.phone.label:`),
      ],
    ),
  });

  public readonly pastDateConstraints = DateConstraints.adultDateOfBirth;
  public phoneMask = phoneMask;

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
