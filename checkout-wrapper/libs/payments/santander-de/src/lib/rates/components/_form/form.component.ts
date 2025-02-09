import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { defer } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FinanceTypeEnum, RateSummaryInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  ExtraMapperService,
  FormValue,
  RateInterface,
  RatesCalculationService,
} from '../../../shared';

@Component({
  selector: 'rates-form',
  templateUrl: './form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class FormComponent implements OnInit {

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Output() selectRate = new EventEmitter<RateSummaryInterface>();

  @Output() submitted = this.submit$.pipe(
    tap(() => {
      this.formGroupDirective.onSubmit(null);
    }),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value),
  );

  public flow = this.store.selectSnapshot(FlowState.flow);
  public paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);

  public readonly formGroup = this.fb.group({
    ratesForm: [null],
    termsForm: [null],
    hiddenForm: this.fb.group({
      credit_duration_in_months: this.fb.control<number>(null, Validators.required),
    }),
  });

  protected initialRate: RateInterface;

  public rates$ = defer(() => this.formGroup.valueChanges.pipe(
    startWith(this.formGroup.value),
    switchMap(values => this.ratesCalculationService.fetchRates(
      this.flow,
      {
        ...values.ratesForm,
        cpi: false,
      },
    )),
    tap((rates) => {
      this.initialRate = rates.find(rate =>
        rate.duration === this.formGroup.get('hiddenForm.credit_duration_in_months').value) || rates?.[0];
    }),
  ));

  public readonly translations = {
    legalPromoConditions: $localize`:@@santander-de.inquiry.legal_promo_conditions.text:`,
  };

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private currencyPipe: CurrencyPipe,
    private ratesCalculationService: RatesCalculationService,
    private nodeFlowService: NodeFlowService,
    private submit$: PaymentSubmissionService,
    private destroy$: PeDestroyService,
    private readonly extraMapper: ExtraMapperService,
  ) { }

  ngOnInit(): void {
    const formData = this.store.selectSnapshot<FormValue>(PaymentState.form);
    this.formGroup.patchValue({
      ...this.extraMapper.map(this.flow.extra),
      ...formData,
    });

    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.store.dispatch(new PatchFormState(value));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onSelectRate(rate: RateInterface): void {
    if (rate) {
      this.nodeFlowService.assignPaymentDetails({ rate });
      this.selectRate.emit(this.prepareRateSummary(rate));
      this.formGroup.get('hiddenForm.credit_duration_in_months').setValue(rate.duration);
    }
  }

  private prepareRateSummary(rate: RateInterface): RateSummaryInterface {
    const monthlyRateStr = this.currencyPipe.transform(
      rate.monthlyPayment,
      this.flow.currency,
      'symbol',
    );

    const durationStr = rate.duration > 1
      ? $localize`:@@santander-de.credit_rates.months:`
      : $localize`:@@santander-de.credit_rates.month:`;

    const total = `${rate.duration} ${durationStr}`;
    const downPayment = this.formGroup.get('ratesForm').value?.downPayment || 0;

    const rateInfo: RateSummaryInterface = {
      chooseText: this.flow.financeType === FinanceTypeEnum.FINANCE_CALCULATOR
        ? $localize`:@@santander-de.credit_rates.actions.rate_choose_summary_finance_calc:${monthlyRateStr}:total:${total}:duration:`
        : $localize`:@@santander-de.credit_rates.actions.rate_choose_summary:${monthlyRateStr}:total:${total}:duration:`,
      totalAmount: (rate.totalCreditCost || 0) + downPayment,
      downPayment: downPayment,
    };

    return rateInfo;
  }
}
