import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import {
  EmploymentFormValue,
  PERSON_TYPE,
  FormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { PaymentState } from '@pe/checkout/store';


import { STUDY_PROFESSIONS, UNEMPLOYED_PROFESSIONS } from './employment.constants';

@Component({
  selector: 'employment-form',
  templateUrl: './employment-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmploymentFormComponent extends CompositeForm<EmploymentFormValue> implements OnInit {
  private store = this.injector.get(Store);
  public personType = this.injector.get(PERSON_TYPE);

  public readonly formGroup = this.fb.group({
    employer: this.fb.control(null, [Validators.maxLength(50), Validators.required]),
    employedSince: this.fb.control(null, RequiredDate),
    _isTemporaryUntil: this.fb.control(null),
    temporaryEmployedUntil: this.fb.control({
      disabled: true,
      value: null,
    },
    RequiredDate),
  });

  private formData$: Observable<FormValue> = this.store.select(PaymentState.form);

  private profession$ = this.formData$.pipe(
    map(formData => (formData?.detailsForm as any)?.[this.personType]?.profession
      || formData?.[this.personType]?.personalForm?.profession
    ),
    distinctUntilChanged((a, b) => a === b),
    tap((profession) => {
      const isUnemployed = UNEMPLOYED_PROFESSIONS.includes(profession);

      if (isUnemployed) {
        this.formGroup.disable();
      } else {
        this.formGroup.enable();
        this.formGroup.get('_isTemporaryUntil').setValue(
          Boolean(this.formGroup.get('temporaryEmployedUntil').value)
        );
      }
    })
  );

  public translations$ = this.profession$.pipe(
    map((profession) => {
      const isStudent = STUDY_PROFESSIONS.includes(profession);

      return {
        title: isStudent
          ? $localize`:@@payment-santander-de-pos.inquiry.sections.study.title:`
          : $localize`:@@payment-santander-de-pos.inquiry.sections.employment.title:`,
        _isTemporaryUntil: $localize`:@@payment-santander-de-pos.inquiry.form.customer._isTemporayUntil.label:`,
        customer: {
          employer: $localize`:@@payment-santander-de-pos.inquiry.form.customer.employer.label:`,
          employedSince: $localize`:@@payment-santander-de-pos.inquiry.form.customer.employedSince.label:`,
          temporaryEmployedUntil: $localize`:@@payment-santander-de-pos.inquiry.form.customer.temporaryEmployedUntil.label:`,
        },
        guarantor: {
          employer: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.employer.label:`,
          employedSince: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.employedSince.label:`,
          temporaryEmployedUntil: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.temporaryEmployedUntil.label:`,
        },
      };
    })
  );

  public readonly pastDateConstraints = DateConstraints.shortConstraints(DateConstraints.past);
  public readonly futureDateConstraints = DateConstraints.shortConstraints(DateConstraints.future);

  ngOnInit(): void {
    super.ngOnInit();

    const toggleTemporaryUntil$ = this.formGroup.get('_isTemporaryUntil').valueChanges.pipe(
      startWith(this.formGroup.get('_isTemporaryUntil').value),
      tap((value) => {
        value
          ? this.formGroup.get('temporaryEmployedUntil').enable()
          : this.formGroup.get('temporaryEmployedUntil').disable();
      }),
    );

    toggleTemporaryUntil$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onShortDateSelected(date: Date, datepicker: MatDatepicker<unknown>, controlName: string): void {
    datepicker.close();
    this.formGroup.get(controlName).setValue(date);
  }
}
