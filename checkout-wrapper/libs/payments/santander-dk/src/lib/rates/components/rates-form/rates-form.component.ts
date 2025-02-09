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
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PatchFormState, PaymentState } from '@pe/checkout/store';
import {
  FlowInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { FormValue, RateInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-dk-rates-form',
  templateUrl: './rates-form.component.html',
})
export class RatesFormComponent
  implements OnInit {

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() flow: FlowInterface;
  @Input() paymentTitle: string;
  @Input() embeddedMode: boolean;
  @Input() paymentMethod: PaymentMethodEnum;

  @Output() selectRate: EventEmitter<RateInterface> = new EventEmitter();
  @Output() ratesLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() ratesLoadingError: EventEmitter<boolean> = new EventEmitter();
  @Output() showRatesStepEdit: EventEmitter<void> = new EventEmitter();
  @Output() productPanelOpened: EventEmitter<number> = new EventEmitter();

  @Output() submitted = this.submit$.pipe(
    tap(() => {
      this.formGroupDirective.onSubmit(null);
    }),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value as FormValue),
  );

  public selectedRateTitle$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  public formGroup = this.fb.group({
    ratesForm: [null, Validators.required],
    termsForm: [null, Validators.required],
  });

  public readonly translations = {
    subscribeToOffersText: $localize `:@@santander-dk.inquiry.subscribe_to_offers.text:`,
    subscribeToOffersTitle: $localize `:@@santander-dk.inquiry.subscribe_to_offers.title:`,
  };

  constructor(
    protected customElementService: CustomElementService,
    private store: Store,
    private fb: FormBuilder,
    private currencyPipe: CurrencyPipe,
    private analyticsFormService: AnalyticsFormService,
    private submit$: PaymentSubmissionService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['geocoder-24'],
      null,
      this.customElementService.shadowRoot
    );
    const formData = this.store.selectSnapshot(PaymentState.form);
    this.formGroup.patchValue(formData);
    this.formGroup.valueChanges.pipe(
      tap(value => this.store.dispatch(new PatchFormState({ ...value }))),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onProductOrRateSelected(rate: RateInterface): void {
    this.selectRate.emit(rate);
    const fee = this.currencyPipe.transform(
      rate?.parameters?.monthlyAdministrationFee ?? 0,
      this.flow.currency,
      'symbol',
      '1.2-2',
    );
    const title = $localize`:@@santander-dk.credit_rates.monthly_administration_fee_note:\
      ${fee}:monthly_administration_fee:`;
    this.selectedRateTitle$.next(title);
  }
}
