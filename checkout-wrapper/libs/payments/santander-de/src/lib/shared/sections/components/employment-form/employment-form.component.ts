import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { merge } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { PaymentState } from '@pe/checkout/store';

import {
  EMPLOYMENT_NOT_WORKING,
  EMPLOYMENT_STUDY,
  EmploymentChoice,
  EmploymentFormValue,
  FormValue,
  PERSON_TYPE,
} from '../../..';

@Component({
  selector: 'employment-form',
  templateUrl: './employment-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmploymentFormComponent extends CompositeForm<EmploymentFormValue> implements OnInit {

  private store = this.injector.get(Store);
  private personType = this.injector.get(PERSON_TYPE);

  public readonly freelancerForm = this.fb.group({
    freelancerEmployedSince: [null, RequiredDate],
    freelancerCompanyName: [null, Validators.required],
  });

  public readonly formGroup = this.fb.group({
    freelancer: this.freelancerForm,
    employer: [{ value: null, disabled: true }, [Validators.required, Validators.maxLength(50)]],
    employedSince: [{ value: null, disabled: true }, RequiredDate],
    prevEmployer: [null, [Validators.required, Validators.maxLength(50)]],
    prevEmployedSince: [null, RequiredDate],
    employmentLimited: [{ value: false, disabled: true }],
    employedUntil: [null, RequiredDate],
  });

  public readonly pastDateConstraints = DateConstraints.past;
  public readonly futureDateConstraints = DateConstraints.future;
  private readonly formData$ = this.store.select<FormValue>(PaymentState.form);

  private readonly employment$ = this.formData$.pipe(
    startWith(this.store.selectSnapshot<FormValue>(PaymentState.form)),
    filter(v => Boolean(v)),
    map((formData) => {
      const { employment, freelancer } = formData[this.personType]?.personalForm || {};

      return { employment, freelancer };
    }),
    distinctUntilChanged((a, b) =>
      a.employment === b.employment &&
      a.freelancer === b.freelancer
    ),
    map(({ employment, freelancer }) => {
      const isUnemployed = EMPLOYMENT_NOT_WORKING.includes(employment as EmploymentChoice);
      const isFreelancer = !isUnemployed && freelancer;
      const isEmployed = !isUnemployed && !isFreelancer;

      return {
        isStudent: EMPLOYMENT_STUDY.includes(employment as EmploymentChoice),
        isFreelancer,
        isEmployed,
        isSelfEmployed: employment === EmploymentChoice.SELF_EMPLOYED,
      };
    })
  );

  public readonly translations$ = this.employment$.pipe(
    map(({ isStudent, isSelfEmployed }) => ({
      title: isStudent
        ? $localize`:@@santander-de.inquiry.step.customer_employment.title_study:`
        : $localize`:@@santander-de.inquiry.step.customer_employment.title_employment:`,
      employer: {
        label: isStudent
          ? $localize`:@@santander-de.inquiry.form.customer.schoolOrUniversity.label:`
          : isSelfEmployed
            ? $localize `:@@santander-de.inquiry.form.customer.selfEmployedCompanyName:`
            : $localize`:@@santander-de.inquiry.form.customer.employer.label:`,
      },
      employedSince: {
        label: isStudent
          ? $localize`:@@santander-de.inquiry.form.customer.studySince.label:`
          : isSelfEmployed
          ? $localize `:@@santander-de.inquiry.form.customer.selfEmployedEmployedSince:`
          : $localize`:@@santander-de.inquiry.form.customer.employedSince.label:`,
      },
      employmentLimited: $localize`:@@santander-de.inquiry.form.customer.employmentLimited.label:`,
    }))
  );

  ngOnInit(): void {
    super.ngOnInit();

    const onEmploymentChange$ = this.employment$.pipe(
      tap(({ isSelfEmployed, isStudent, isFreelancer, isEmployed }) => {
        isFreelancer ? this.formGroup.get('freelancer').enable() : this.formGroup.get('freelancer').disable();
        if (isFreelancer) {
          this.formGroup.get('employer').disable();
          this.formGroup.get('employedSince').disable();
          this.formGroup.get('employmentLimited').disable();
          this.formGroup.get('employedUntil').disable();
        }
        if (isEmployed || isSelfEmployed) {
          this.formGroup.get('employer').enable();
          this.formGroup.get('employedSince').enable();

          if (isStudent || isSelfEmployed) {
            this.formGroup.get('employmentLimited').disable();
            this.formGroup.get('employedUntil').disable();
          } else {
            this.formGroup.get('employmentLimited').enable();
          }
        }
      })
    );

    const toggleEmployedUntil$ = this.formGroup.get('employmentLimited').valueChanges.pipe(
      startWith(this.formGroup.get('employmentLimited').value),
      withLatestFrom(this.employment$),
      tap(([value, { isStudent, isEmployed }]) => {
        value && !isStudent && isEmployed
          ? this.formGroup.get('employedUntil').enable()
          : this.formGroup.get('employedUntil').disable();
      }),
    );

    const togglePrevFreelance$ = this.freelancerForm.get('freelancerEmployedSince').valueChanges.pipe(
      startWith(this.freelancerForm.get('freelancerEmployedSince').value),
      filter(() => this.freelancerForm.enabled),
    );

    const togglePrevEmployer$ = this.formGroup.get('employedSince').valueChanges.pipe(
      startWith(this.formGroup.get('employedSince').value),
      filter(() => this.formGroup.get('employer').enabled),
    );

    const togglePrev$ = merge(
      togglePrevFreelance$,
      togglePrevEmployer$,
    ).pipe(
      tap((value) => {
        const inPast6Months = dayjs(value) > dayjs().subtract(6, 'months');
        const inPast = dayjs(value) <= dayjs();

        if (inPast6Months && inPast) {
          this.formGroup.get('prevEmployer').enable();
          this.formGroup.get('prevEmployedSince').enable();
        } else {
          this.formGroup.get('prevEmployer').disable();
          this.formGroup.get('prevEmployedSince').disable();
        }
      }),
    );

    merge(
      onEmploymentChange$,
      toggleEmployedUntil$,
      togglePrev$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
