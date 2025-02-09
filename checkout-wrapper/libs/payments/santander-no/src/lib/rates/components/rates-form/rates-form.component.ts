import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { validateNorwegianIdNumber } from 'norwegian-national-id-validator';
import { defer } from 'rxjs';
import { filter, map, startWith, takeUntil, tap } from 'rxjs/operators';

import { AnalyticConsentEventEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { PhoneValidators } from '@pe/checkout/forms/phone';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import {
  FlowExtraDurationType,
  FlowInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  RateInterface,
  SelectedInterface,
  ProductTypeEnum,
  RatesFormInterface,
} from '../../../shared';
import { RatesEditListComponent } from '../rates-edit-list/rates-edit-list.component';

const ssnValidator = (control: AbstractControl): ValidationErrors => !control.value
  || validateNorwegianIdNumber(control.value)
    ? null
    : { invalid: true };

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-no-rates-form',
  providers: [CurrencyPipe],
  templateUrl: './rates-form.component.html',
  styles: ['.checkbox-label { margin: auto; }'],
})
export class RatesFormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private ngForm: NgForm;

  @ViewChild('ratesListElem', { static: false }) ratesListElem: RatesEditListComponent;

  @Input() set extraDuration(duration: FlowExtraDurationType) {
    this.onlyDuration = duration;
  }

  @Output() selectRate = new EventEmitter<RateInterface>();

  @Output() ratesLoading = new EventEmitter<boolean>();

  @Output() ratesLoadingError = new EventEmitter<boolean>();

  @Output() submitted = this.submit$.pipe(
    map(() => {
      if (this.isRatesLoading || this.hasRatesLoadError) {
        this.ratesListElem.fetchRates();

        return { valid: false, value: null };
      }

      const { valid, value } = this.formGroup;
      this.ngForm.ngSubmit.emit(value);
      this.ngForm.onSubmit(null);
      this.cdr.markForCheck();

      return { value, valid };
    }),
    filter(({ valid }) => valid),
    map(({ value }) => value as RatesFormInterface),
  );

  public isRatesLoading = false;
  public hasRatesLoadError = false;
  public onlyDuration: FlowExtraDurationType;
  public readonly analyticConsentEventEnum = AnalyticConsentEventEnum;
  public readonly translations = {
    acceptedCreditCheck: $localize `:@@santander-no.inquiry.form.accepted_credit_check.label:`,
  };

  private initialValue: RatesFormInterface = this.store
    .selectSnapshot(PaymentState.form)
    ?.formRates || {};

  public formGroup = this.fb.group({
    campaignCode: this.fb.control<string>(
      this.initialValue.campaignCode, Validators.required),
    monthlyAmount: this.fb.control<number>(
      this.initialValue.monthlyAmount, Validators.required),
    creditType: this.fb.control<ProductTypeEnum>(
      this.initialValue.creditType ?? ProductTypeEnum.HANDLEKONTO, Validators.required),
    socialSecurityNumber: this.fb.control<string>(
      this.initialValue.socialSecurityNumber, [Validators.required, ssnValidator]),
    telephoneMobile: this.fb.control<string>(
       this.initialValue.telephoneMobile || this.flow.billingAddress?.phone,
      [
        Validators.required,
        PhoneValidators.country('NO', $localize`:@@santander-no.inquiry.form.telephone_mobile.label:`),
        PhoneValidators.codeRequired('NO'),
      ],
    ),
    acceptedCreditCheck: this.fb.control<boolean>(
      !!this.initialValue.acceptedCreditCheck, [Validators.requiredTrue]),
  });

  public initialRate$ = defer(() => this.formGroup.valueChanges.pipe(
    startWith(this.formGroup.value as any),
    map(({ acceptedCreditCheck, ...rest }: RatesFormInterface) => rest),
  ));

  constructor(
    protected customElementService: CustomElementService,
    private store: Store,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private analyticsFormService: AnalyticsFormService,
    private submit$: PaymentSubmissionService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['help-24', 'info-16', 'arrow-left-16'],
      null,
      this.customElementService.shadowRoot
    );
    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.store.dispatch(new PatchFormState({ formRates: value }));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onRateSelected(selected: SelectedInterface): void {
    this.formGroup.patchValue(selected.data);
    this.selectRate.next(selected.rate);
  }
}
