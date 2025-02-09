import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

import { RateInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-fact-form-rates',
  templateUrl: './rates-form.component.html',
})
export class RatesFormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() set flowTotal(total: number) {
    this.flowTotal$.next(total);
  }

  @Output() selectRate = new EventEmitter<RateInterface>();

  @Output() submitted = this.submit$.pipe(
    tap(() => this.formGroupDirective.onSubmit(null)),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value),
  );

  formGroup = this.fb.group({
    ratesForm: this.fb.group({
      duration: this.fb.control<number>(null, Validators.required),
      totalCreditCost: this.fb.control<number>(null),
      interestRate: this.fb.control<number>(null),
      monthlyPayment: this.fb.control<number>(null),
      lastMonthPayment: this.fb.control<number>(null),
    }),
    personalForm: [null, Validators.required],
    termsForm: [null, Validators.required],
  });

  public ratesParams$ = this.store.select(FlowState.flow).pipe(
    map(({ total }) => ({ amount: total })),
  );

  public rates$ = new BehaviorSubject<RateInterface[]>(null);
  public lastCreditDuration$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public selectedRate$: Observable<RateInterface> = combineLatest([
    this.rates$,
    this.lastCreditDuration$,
  ]).pipe(
      map((data: [RateInterface[], number]) => (data[0] || []).find(rate => rate.duration === data[1])
    )
  );

  private flowTotal$: BehaviorSubject<number> = new BehaviorSubject(null);

  get merchantAddress(): string {
    return this.flow.businessAddressLine
      ? [this.flow.businessName, this.flow.businessAddressLine].filter(d => !!d).join(', ')
      : null;
  }

  get inquiryExtraText(): string {
    return $localize `:@@inquiry.extra_text:${this.merchantAddress}:merchantAddress:`;
  }

  constructor(
    protected customElementService: CustomElementService,
    private store: Store,
    private fb: FormBuilder,
    private analyticsFormService: AnalyticsFormService,
    private submit$: PaymentSubmissionService,
  ) {}

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['xls-24'],
      null,
      this.customElementService.shadowRoot
    );

    const formData = {
      personalForm: {
        phone: this.flow.billingAddress?.phone,
        birthday: this.flow.apiCall?.birthDate,
      },
      ...this.store.selectSnapshot(PaymentState.form),
    };

    this.formGroup.patchValue(formData);
  }

  public onSelectRate(rate: RateInterface): void {
    this.formGroup.get('ratesForm').patchValue(rate);
    this.selectRate.emit(rate);
    this.store.dispatch(new PatchFormState({ ratesForm: rate }));
  }
}
