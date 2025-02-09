import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { ModeEnum } from '@pe/checkout/form-utils';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import {
  IncomeService,
  PersonTypeEnum,
  RateDataInterface,
  RateInterface,
  SelectedInterface,
  FormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, ParamsState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FlowExtraDurationType } from '@pe/checkout/types';
import { CurrencySymbolPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { DetailsFormService, TermsFormService } from '../../../shared/sections';

@Component({
  selector: 'santander-de-pos-form',
  templateUrl: './form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe, CurrencySymbolPipe, PeDestroyService],
})
export class FormComponent implements OnInit {
  @SelectSnapshot(ParamsState.merchantMode) private merchantMode!: boolean;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() extraDuration: FlowExtraDurationType;

  @Input() mode: ModeEnum;

  @Output() rateSelected = new EventEmitter<RateDataInterface>();

  @Output() submitted = this.submit$.pipe(
    tap(() => {
      this.formGroupDirective.onSubmit(null);
    }),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value),
  );

  public readonly modeEnum = ModeEnum;
  public selectedRate: RateInterface;

  public readonly formGroup = this.fb.group({
    ratesForm: [null],
    detailsForm: [null],
    termsForm: [null],
    protectionForm: [{ value: null, disabled: true }],
  });

  public readonly currency = this.store.selectSnapshot(FlowState.flow).currency;
  public readonly paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
  public readonly options$ = this.store.select(PaymentState.options);

  private readonly defaultCreditProtectionInsurance = true;

  constructor(
    public incomeService: IncomeService,
    private store: Store,
    private fb: FormBuilder,
    private submit$: PaymentSubmissionService,
    private destroy$: PeDestroyService,
    private detailsFormService: DetailsFormService,
    private termsFormService: TermsFormService,
  ) {}

  ngOnInit() {
    this.merchantMode
      ? this.formGroup.get('protectionForm').enable()
      : this.formGroup.get('protectionForm').disable();

    this.patchForm();

    const cpiTariff$ = this.incomeService.cpiTariff$.pipe(
      filter(() => this.merchantMode),
      distinctUntilChanged((v1, v2) => Boolean(v1) === Boolean(v2)),
      withLatestFrom(this.store.select(PaymentState.form)),
      tap(([cpiTariff, formData]: [number, FormValue]) => {
        const protectionForm = this.formGroup.get('protectionForm');
        const newProtectionForm = {
          ...cpiTariff ? {
            _yes: formData?.protectionForm?._yes ?? !!cpiTariff,
            dataForwardingRsv: formData?.protectionForm?.dataForwardingRsv,
            _no: formData?.protectionForm?._no ?? !cpiTariff,
          } : {
            _yes: !!cpiTariff,
            _no: !cpiTariff,
          },
        };

        const isProtectionFormChanges = !Object.entries(newProtectionForm).every(
          ([key, value]) => value === protectionForm.value[key]
        );

        isProtectionFormChanges && this.formGroup.patchValue({
          protectionForm: newProtectionForm,
        });

        cpiTariff
          ? protectionForm.enable()
          : protectionForm.disable();
      }),
    );

    const valueChanges$ = this.formGroup.valueChanges.pipe(
      tap((value) => {
        const formData: FormValue = this.store.selectSnapshot(PaymentState.form);

        this.store.dispatch(new PatchFormState({
          ...value,
          [PersonTypeEnum.Customer]: {
            ...formData?.[PersonTypeEnum.Customer],
            ...value?.protectionForm && { protectionForm: value.protectionForm },
          },
        }));
      }),
    );

    merge(
      cpiTariff$,
      valueChanges$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onRateSelected(selected: SelectedInterface): void {
    const downPayment = this.formGroup.get('detailsForm').value?.downPayment;
    const rate: RateDataInterface = {
      raw: selected.rate,
      downPayment,
      total: (selected.rate?.totalCreditCost || 0) + downPayment,
    };
    this.selectedRate = selected.rate;
    this.rateSelected.emit(rate);
  }

  private patchForm(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);

    this.formGroup.patchValue({
      ratesForm: formData?.ratesForm,
      detailsForm: this.detailsFormService.initialDetailsForm,
      termsForm: this.termsFormService.initialTermsForm,
      protectionForm: {
        ...formData?.customer?.protectionForm,
        ...this.formGroup.value.protectionForm?.creditProtectionInsurance
          ? this.formGroup.value.protectionForm
          : {
            ...this.formGroup.value.protectionForm,
            _yes: formData?.protectionForm?._yes ?? this.defaultCreditProtectionInsurance,
          },
      },
    });
  }
}
