import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { DateConstraints, RequiredDate } from '@pe/checkout/forms/date';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, PaymentSpecificStatusEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { BOOLEAN_OPTIONS, EMPLOYMENT_STATUSES } from '../../../constants';

export interface PersonalFormValue {
  norwegianCitizen: boolean;
  residentialStatus: string;
  maritalStatus: string;
  professionalStatus: string;
  employedSince: Date;
  employmentPercent: number;
  employer: string;
  netMonthlyIncome: number;
  rentIncome: number;
  numberOfChildren: number;
}

@Component({
  selector: 'santander-no-personal-form',
  templateUrl: './personal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PersonalFormComponent extends CompositeForm<PersonalFormValue> implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  private store = this.injector.get(Store);
  private domSanitizer = this.injector.get(DomSanitizer);
  private matIconRegistry = this.injector.get(MatIconRegistry);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  public readonly pastDateConstraints = DateConstraints.past;
  public readonly booleanOptions = BOOLEAN_OPTIONS;
  private readonly localeConfig = this.localeConstantsService.getLocaleConfig();
  public readonly options$ = this.store.select(PaymentState.options);

  private specificStatus = this.store
    .selectSnapshot(PaymentState.response)
    ?.payment
    ?.specificStatus;

  public formGroup = this.fb.group({
    norwegianCitizen: this.fb.control<boolean>(null, Validators.required),
    residentialStatus: this.fb.control<string>(null, Validators.required),
    maritalStatus: this.fb.control<string>(null, Validators.required),
    professionalStatus: this.fb.control<string>(null, Validators.required),
    employedSince: this.fb.control<Date>(null, RequiredDate),
    employmentPercent: this.fb.control<number>(null, [Validators.required, Validators.max(100)]),
    employer: this.fb.control<string>(null, Validators.required),
    netMonthlyIncome: this.fb.control<number>(
      {
        value: null,
        disabled: this.specificStatus === PaymentSpecificStatusEnum.NEED_MORE_INFO_IIR,
      },
      Validators.required,
    ),
    rentIncome: this.fb.control<number>(
      {
        value: null,
        disabled: this.specificStatus !== PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
      },
      Validators.required,
    ),
    numberOfChildren: this.fb.control<number>(
      {
        value: null,
        disabled: this.specificStatus !== PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
      },
      Validators.required,
    ),
  });

  public translations = {
    rentIncome: {
      tooltip: $localize`:@@santander-no.inquiry.form.rent_income.tooltip:`,
    },
  };

  ngOnInit(): void {
    super.ngOnInit();
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot
    );
    this.formGroup.get('professionalStatus').valueChanges.pipe(
      startWith(this.formGroup.get('professionalStatus').value),
      tap((value) => {
        if (EMPLOYMENT_STATUSES.includes(value)) {
          this.formGroup.get('employer').enable();
          this.formGroup.get('employedSince').enable();
          this.formGroup.get('employmentPercent').enable();
        } else {
          this.formGroup.get('employer').disable();
          this.formGroup.get('employedSince').disable();
          this.formGroup.get('employmentPercent').disable();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public setMonthAndYear(date: any, element: any): void {
    element.close();
    const dateWithDay = new Date(date.getFullYear(), date.getMonth(), new Date().getDay());
    this.formGroup.get('employedSince')?.setValue(dateWithDay);
  }

  registerOnChange(fn: (value: PersonalFormValue) => void): void {
    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.onTouch?.();
        fn({
          ...value,
          numberOfChildren: Number(value.numberOfChildren),
          netMonthlyIncome: Number(value.netMonthlyIncome),
          rentIncome: Number(value.rentIncome),
          employmentPercent: Number(value.employmentPercent),
        } as PersonalFormValue);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
