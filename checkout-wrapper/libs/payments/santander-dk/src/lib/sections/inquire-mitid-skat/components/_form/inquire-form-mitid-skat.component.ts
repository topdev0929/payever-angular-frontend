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
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { ModeEnum } from '@pe/checkout/form-utils';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  BankConsentFormValue,
  FormValue,
  MitIdFormValue,
  RateInterface,
  SkatIdFormValue,
} from '../../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-dk-inquire-form-mitid-skat',
  templateUrl: './inquire-form-mitid-skat.component.html',
})
export class InquireFormMitidSkatComponent implements OnInit {
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @Input() public mode: ModeEnum;

  @Output() selectRate: EventEmitter<RateInterface> = new EventEmitter();
  @Output() ratesLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() ratesLoadingError: EventEmitter<boolean> = new EventEmitter();
  @Output() serviceReady: EventEmitter<boolean> = new EventEmitter();
  @Output() showRatesStepEdit: EventEmitter<void> = new EventEmitter();
  @Output() productPanelOpened: EventEmitter<number> = new EventEmitter();
  @Output() submitted = new EventEmitter<FormValue>();

  public readonly modeEnum = ModeEnum;

  public formGroup = this.fb.group({
    mitIdForm: this.fb.control<MitIdFormValue>(null, Validators.required),
    skatIdForm: this.fb.control<SkatIdFormValue>(null, Validators.required),
    bankConsentForm: this.fb.control<BankConsentFormValue>(null, Validators.required),
  });

  constructor(
    protected customElementService: CustomElementService,
    private store: Store,
    private fb: FormBuilder,
    private analyticsFormService: AnalyticsFormService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['geocoder-24'],
      null,
      this.customElementService.shadowRoot
    );

    this.store.select(PaymentState.form).pipe(
      filter((v => Boolean(v))),
      take(1),
      tap((formData) => {
        this.formGroup.patchValue({
          mitIdForm: formData.mitIdForm,
          skatIdForm: formData.skatIdForm,
          bankConsentForm: formData.bankConsentForm,
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onSubmit(): void {
    this.submitted.emit(this.formGroup.value as FormValue);
  }
}
