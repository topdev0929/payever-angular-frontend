import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { PhoneValidators, phoneMask } from '@pe/checkout/forms/phone';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';


interface InfoFormInterface {
  birthday: string;
  phone: string;
}

@Component({
  selector: 'details-form',
  templateUrl: './personal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalFormComponent extends CompositeForm<InfoFormInterface> implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

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

  private matIconRegistry = this.injector.get(MatIconRegistry);
  private domSanitizer = this.injector.get(DomSanitizer);

  public phoneMask = phoneMask;

  ngOnInit(): void {
    super.ngOnInit();
    this.matIconRegistry.addSvgIcon(
      'calendar',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar.svg'),
    );
  }

  writeValue(obj: InfoFormInterface): void {
    this.formGroup.patchValue(obj);

    obj && Object.entries(obj).forEach(([key, value]) => {
      value && this.formGroup.get(key).disable();
    });
  }
}
