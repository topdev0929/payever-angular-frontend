import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { combineLatest, merge } from 'rxjs';
import { takeUntil, tap, map } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FormOptionInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  BOOLEAN_OPTIONS,
  PAY_SOURCES_TRANSLATIONS,
  PROFESSIONAL_STATUS_TRANSLATIONS,
} from './boolean-options.constant';

interface PaymentOptions {
  isAmlEnabled: boolean;
  paySources: FormOptionInterface[];
  professionalStatuses: FormOptionInterface[];
  maritalStatuses: FormOptionInterface[];
  residentialStatuses: FormOptionInterface[];
}

export interface AmlFormInterface {
  politicalExposedPerson: boolean;
  appliedOnBehalfOfOthers: boolean;
  payWithMainIncome: boolean;
  paySource: string;
  professionalStatus: string;
  otherPaySource: string;
  amlEnabled: boolean;
}

@Component({
  selector: 'santander-no-invoice-aml-form',
  templateUrl: './aml-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ['.icon { margin-left: 7px; }'],
  providers: [PeDestroyService],
})
export class AmlFormComponent extends CompositeForm<AmlFormInterface> implements OnInit {

  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod!: PaymentMethodEnum;

  private store = this.injector.get(Store);

  public readonly options: PaymentOptions = this.store.selectSnapshot(PaymentState.options);

  public formGroup = this.fb.group({
    politicalExposedPerson: this.fb.control<boolean>(null, Validators.required),
    appliedOnBehalfOfOthers: this.fb.control<boolean>(null, Validators.required),
    payWithMainIncome: this.fb.control<boolean>(null, Validators.required),
    paySource: this.fb.control<string>({ disabled: true, value: null }, Validators.required),
    professionalStatus: this.fb.control<string>({ disabled: true, value: null }, Validators.required),
    otherPaySource: this.fb.control<string>({ disabled: true, value: null }, Validators.required),
    amlEnabled: this.fb.control<boolean>(this.options.isAmlEnabled, Validators.required),
  });

  public readonly booleanOptions = BOOLEAN_OPTIONS;
  public readonly paymentOptions$ = this.store.select<PaymentOptions>(PaymentState.options).pipe(
    map(({ professionalStatuses, paySources }) => ({
      paySources: paySources?.map(item => ({
        label: PAY_SOURCES_TRANSLATIONS[item.value as string] || item.label,
        value: item.value,
      })) || [],
      professionalStatuses: professionalStatuses?.map(item => ({
        label: PROFESSIONAL_STATUS_TRANSLATIONS[item.value as string] || item.label,
        value: item.value,
      })) || [],
      appliedOnBehalfOfOthers: {
        tooltip: $localize`:@@santander-no-invoice.inquiry.form.applied_on_behalf_of_others.tooltip:`,
      },
      politicalExposedPerson: {
        tooltip: $localize`:@@santander-no-invoice.inquiry.form.political_exposed_person.tooltip:`,
      },
    }))
  );

  ngOnInit(): void {
    super.ngOnInit();

    const paySourceStatus$ = this.formGroup.get('payWithMainIncome').valueChanges.pipe(
      tap((value) => {
        const amlEnabled = this.store.selectSnapshot(PaymentState.options)
          ?.isAmlEnabled;

        if (amlEnabled && !value) {
          this.formGroup.get('paySource').enable();
          this.formGroup.get('professionalStatus').disable();
        } else {
          this.formGroup.get('paySource').disable();
          this.formGroup.get('professionalStatus').enable();
        }
      }),
    );

    const otherPaySourceStatus$ = combineLatest([
      this.formGroup.get('paySource').valueChanges,
      this.formGroup.get('paySource').statusChanges,
    ]).pipe(
      tap(([value, status]) => {
        value === 'OTHER' && status !== 'DISABLED'
          ? this.formGroup.get('otherPaySource').enable()
          : this.formGroup.get('otherPaySource').disable();
      }),
    );

    merge(
      paySourceStatus$,
      otherPaySourceStatus$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
