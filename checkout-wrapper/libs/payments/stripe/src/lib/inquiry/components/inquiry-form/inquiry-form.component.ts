import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { filter, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  creditCardExpirationMaskFn,
  creditCardExpirationUnmaskFn,
  creditCardMaskFn,
  creditCardUnmaskFn,
} from './utils';
import {
  creditCardExpirationValidator,
  creditCardNumberValidator,
  CreditCardValidator,
} from './validators';

interface PaymentDetails {
  cardNumber: string;
  cardHolderName: string;
  cardExpiration: [string, string];
  cardCvc: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-inquiry-form',
  templateUrl: './inquiry-form.component.html',
  providers: [PeDestroyService, CreditCardValidator],
})
export class InquiryFormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  @SelectSnapshot(PaymentState.details)
  private paymentDetails: PaymentDetails;

  @ViewChild(FormGroupDirective, { static: true }) private ngForm!: FormGroupDirective;

  @Output() submitted: EventEmitter<void> = new EventEmitter();

  @Output() loading = new EventEmitter<boolean>();

  public readonly ccNumberMask = creditCardMaskFn;
  public readonly ccNumberUnmask = creditCardUnmaskFn;
  public readonly ccExpirationMask = creditCardExpirationMaskFn;
  public readonly ccExpirationUnmask = creditCardExpirationUnmaskFn;

  public formGroup = this.fb.group({
    cardNumber: this.fb.control<string>(
      null,
      [Validators.required, creditCardNumberValidator],
    ),
    cardHolderName: this.fb.control<string>(
      this.billingAddressName.toUpperCase()
    ),
    cardExpiration: this.fb.control<string>(
      null,
      [Validators.required, creditCardExpirationValidator],
    ),
    cardCvc: this.fb.control<string>(null, [Validators.required]),
  },
  {
    asyncValidators: [
      this.creditCardValidator.validate.bind(this.creditCardValidator),
    ],
  });

  private get billingAddressName(): string {
    return [this.flow.billingAddress?.firstName, this.flow.billingAddress?.lastName].filter(d => !!d).join(' ').trim();
  }

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private analyticsFormService: AnalyticsFormService,
    private creditCardValidator: CreditCardValidator,
    private submit$: PaymentSubmissionService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    if (this.paymentDetails) {
      this.formGroup.patchValue({
        cardNumber: this.paymentDetails.cardNumber,
        cardHolderName: this.paymentDetails.cardHolderName,
        cardCvc: this.paymentDetails.cardCvc,
        cardExpiration: this.paymentDetails?.cardExpiration?.join(''),
      });
    }

    const statusChanges$ = this.formGroup.statusChanges.pipe(
      startWith(this.formGroup.status),
      tap((value) => {
        this.cdr.markForCheck();
        value !== 'PENDING' && this.loading.emit(false);
      }),
      filter(status => status === 'VALID' || this.formGroup.valid),
      tap(() => {
        this.submitted.emit();
      }),
    );

    this.submit$.pipe(
      tap(() => this.submit()),
      switchMap(() => statusChanges$),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected submit(): void {
    const { value, valid } = this.formGroup;
    this.ngForm.ngSubmit.emit(value);
    this.ngForm.onSubmit(null);
    valid && this.loading.emit(true);
    this.cdr.detectChanges();
  }
}
