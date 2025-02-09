import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'swedbank-inquiry-form',
  templateUrl: './inquiry-form.component.html',
  providers: [PeDestroyService],
})
export class InquiryFormComponent implements OnInit {
  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() billingAddressPhone: string;

  @Output() submitted = this.submit$.pipe(
    tap(() => {
      this.formGroupDirective.onSubmit(null);
    }),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value),
  );

  public readonly formGroup = this.fb.group({
    detailsForm: [null],
  });

  protected allowScrollToError = false;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private analyticsFormService: AnalyticsFormService,
    private destroy$: PeDestroyService,
    private submit$: PaymentSubmissionService,
  ) {}

  ngOnInit() {
    const formData = this.store.selectSnapshot(PaymentState.form);
    this.formGroup.patchValue({
      ...formData,
      detailsForm: {
        phone: formData?.detailsForm?.phone || this.flow.billingAddress?.phone,
      },
    });

    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.store.dispatch(new PatchFormState(value));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
