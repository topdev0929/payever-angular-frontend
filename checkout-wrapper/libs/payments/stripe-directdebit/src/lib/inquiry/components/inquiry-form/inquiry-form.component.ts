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
import { FormBuilder, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { ibanMaskFn, ibanUnmaskFn } from '@pe/checkout/forms/iban';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PaymentState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { FormInterface } from '../../../shared';

interface PaymentDetails {
  iban: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-direct-debit-inquiry-form',
  templateUrl: './inquiry-form.component.html',
  styleUrls: ['./inquiry-form.component.scss'],
})
export class InquiryFormComponent implements OnInit {

  @SelectSnapshot(PaymentState.details)
  private paymentDetails: PaymentDetails;

  @ViewChild(FormGroupDirective) private ngForm: NgForm;

  @Input() set businessName(businessName: string) {
    if (businessName) {
      this.translations$.next({
        acceptMandate: $localize `:@@payment-stripeDirectDebit.inquiry.form.accept_mandate.label:\
        ${businessName}:business_name:`,
      });
    }
  }

  @Output() submitted: EventEmitter<FormInterface> = new EventEmitter();

  public readonly ibanMask = ibanMaskFn;
  public readonly ibanUnmask = ibanUnmaskFn;
  public readonly translations$ = new BehaviorSubject({
    acceptMandate: $localize `:@@payment-stripeDirectDebit.inquiry.form.accept_mandate.label:${'---'}:business_name:`,
  });

  public formGroup = this.fb.group({
    iban: this.fb.control<string>(null, [Validators.required]),
  });

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private analyticsFormService: AnalyticsFormService,
    private submit$: PaymentSubmissionService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit() {
    if (this.paymentDetails) {
      this.formGroup.setValue({
        iban: this.paymentDetails?.iban,
      });
    }

    this.submit$.pipe(
      tap(() => this.submit()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected submit(): void {
    const { valid, value } = this.formGroup;
    this.ngForm.ngSubmit.emit(value);
    this.ngForm.onSubmit(null);
    this.cdr.markForCheck();

    if (valid) {
      this.submitted.emit(value as FormInterface);
    }
  }
}
