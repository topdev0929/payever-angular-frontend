import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { filter, map, tap } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { CurrencySymbolPipe, PaymentHelperService } from '@pe/checkout/utils';

import { FormValue } from '../../../models';
import { TermsService } from '../../../services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-bnpl-inquiry-form',
  providers: [CurrencyPipe, CurrencySymbolPipe],
  templateUrl: './inquiry-form.component.html',
  styles: [`
  .form-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  `],
})
export class InquiryFormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  public formGroup = this.fb.group({
    detailsForm: [null],
    termsForm: [null],
  });

  @Output() submitted = this.submit$.pipe(
    tap(() => {
      this.formGroupDirective.onSubmit(null);
      this.store.dispatch(new PatchFormState(this.formGroup.value));
    }),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value),
  );

  public readonly terms$ = this.inquiryService.getTerms(this.flow.id).pipe(
    tap((terms) => {
      this.paymentHelperService.setPaymentLoading(false);
      terms
        ? this.formGroup.get('termsForm').enable()
        : this.formGroup.get('termsForm').disable();
    }),
  );

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private paymentHelperService: PaymentHelperService,
    private inquiryService: TermsService,
    private submit$: PaymentSubmissionService,
  ) {}

  ngOnInit(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    this.formGroup.patchValue(formData);
  }
}
