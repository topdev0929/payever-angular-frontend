import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { combineLatest, defer } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { DialogService } from '@pe/checkout/dialog';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowExtraDurationType, FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { CurrencySymbolPipe } from '@pe/checkout/utils';

import {
  RateInterface,
  SelectedRateDataInterface,
  SelectedInterface,
  FormInterface,
} from '../../../shared/types';
import {
  RateDetailsDialogComponent,
  RateDetailsDialogDataInterface,
} from '../rate-details-dialog/rate-details-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-uk-shared-form',
  providers: [CurrencySymbolPipe],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod: PaymentMethodEnum;

  public formGroup = this.fb.group({
    // Hidden fields:
    duration: this.fb.control<number>(null, Validators.required),
    downPayment: this.fb.control<number>(null),
    interestRate: this.fb.control<number>(null),
    flatRate: this.fb.control<number>(null),
    monthlyPayment: this.fb.control<number>(null),
    firstMonthPayment: this.fb.control<number>(null),
    lastMonthPayment: this.fb.control<number>(null),
    interest: this.fb.control<number>(null),
    totalCreditCost: this.fb.control<number>(null),
    amount: this.fb.control<number>(null),

    // Visible fields:
    _deposit_view: this.fb.control<number>(null),
  });

  public downPayment$ = defer(() => this.formGroup.get('downPayment').valueChanges.pipe(
    startWith(this.formGroup.get('downPayment').value),
  ));

  public showApply$ = defer(() => combineLatest([
    this.formGroup.get('_deposit_view').valueChanges,
    this.formGroup.get('downPayment').valueChanges.pipe(
      startWith(this.formGroup.get('downPayment').value),
    ),
  ]).pipe(
    map(([depositView, downPayment]) => downPayment !== depositView
      && !this.isRatesLoading),
  ));

  @Input() extraDuration: FlowExtraDurationType;

  @Output() selectRate: EventEmitter<RateInterface> = new EventEmitter();
  @Output() ratesLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() ratesLoadingError: EventEmitter<boolean> = new EventEmitter();
  @Output() submitted = this.submit$.pipe(
    map(() => {
      const { valid, value } = this.formGroup;

      return { valid, value };
    }),
    filter(({ valid }) => !!valid),
    map(({ value }) => value as FormInterface),
  );

  isRatesLoading: boolean;
  hasRatesLoadError: boolean;
  selectedRate: RateInterface;

  formTranslationsScope = 'payment-santander-uk.inquiry.form';

  get todayAsStr(): string {
    return new Date().toJSON().slice(0, 10).split('-').reverse().join('.');
  }

  get translations(): { [key: string]: string } {
    return {
      note1: $localize `:@@payment-santander-uk.inquiry.note1:${this.flow.businessName}:businessName:`,
      note2: $localize `:@@payment-santander-uk.inquiry.note2:${this.todayAsStr}:today:`,
    };
  }

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private analyticsFormService: AnalyticsFormService,
    private dialogService: DialogService,
    private submit$: PaymentSubmissionService,
  ) {}

  ngOnInit() {
    this.formGroup.patchValue(this.store.selectSnapshot(PaymentState.form));
  }

  onRateSelected(selected: SelectedInterface): void {
    const value: SelectedRateDataInterface = { ...this.formGroup.value, ...selected.data };
    this.formGroup.patchValue(value, { emitEvent: false });
    this.selectedRate = selected.rate;
    this.selectRate.emit(selected.rate);
  }

  onInfoButtonClicked(): void {
    const data: RateDetailsDialogDataInterface = {
      flowId: this.flow.id,
      currency: this.flow.currency,
      rate: this.selectedRate,
      total: this.flow.total,
      cart: this.flow.cart,
      businessName: this.flow.businessName,
    };
    this.dialogService.open(RateDetailsDialogComponent, null, data, 'pe-payment-info-dialog');
  }

  apply(): void {
    this.formGroup.get('downPayment').setValue(Number(this.formGroup.get('_deposit_view').value));
  }
}
