import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { Store } from '@ngxs/store';
import { filter, map } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PaymentState, SetFormState } from '@pe/checkout/store';

import { AmlFormInterface } from '../aml-form';
import { DetailsFormInterface } from '../details-form';

export interface FormInterface {
  detailsForm: DetailsFormInterface;
  amlForm: AmlFormInterface;
}

@Component({
  selector: 'santander-no-invoice-form',
  templateUrl: './form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Output() submitted = this.submit$.pipe(
    map(() => {
      const { valid, value } = this.formGroup;
      this.formGroupDirective.ngSubmit.emit(value);
      this.formGroupDirective.onSubmit(null);
      this.store.dispatch(new SetFormState(value));
      this.cdr.markForCheck();

      return { value, valid };
    }),
    filter(({ valid }) => valid),
    map(({ value }) => value as FormInterface),
  );

  public formGroup = this.fb.group({
    detailsForm: [null],
    amlForm: [null],
  });

  private paymentForm = this.store.selectSnapshot(PaymentState.form);

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private submit$: PaymentSubmissionService,
  ) {}

  ngOnInit(): void {
    this.formGroup.patchValue(this.paymentForm);
  }
}
