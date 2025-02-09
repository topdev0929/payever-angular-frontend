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
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';
import { DateUtilService } from '@pe/checkout/utils/date';
import { PeDestroyService } from '@pe/destroy';

import {
  DetailsFormValue,
  FormValue,
  TermsService,
  RatesFormValue,
  TermsFormValue,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-inquiry-form-v2',
  templateUrl: './inquiry-form.component.html',
  styles: [`
  .form-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  `],
  providers: [
    PeDestroyService,
  ],
})
export class InquiryFormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  public formGroup = this.fb.group({
    ratesForm: this.fb.control<RatesFormValue>(null),
    detailsForm: this.fb.control<DetailsFormValue>(null),
    termsForm: this.fb.control<TermsFormValue>(null),
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
    private destroy$: PeDestroyService,
    private dateUtilService: DateUtilService,
  ) {}

  ngOnInit(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    const apiCallPhone = this.flow.billingAddress?.phone;
    const apiCallBirthDate = this.dateUtilService.fixDate(this.flow.apiCall?.birthDate);

    this.formGroup.patchValue({
      ...formData,
      detailsForm: {
        phone: apiCallPhone,
        birthday: apiCallBirthDate,
        ...formData?.detailsForm,
      },
    });

    this.formGroup.valueChanges.pipe(
      switchMap(value => this.store.dispatch(new PatchFormState(value))),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
