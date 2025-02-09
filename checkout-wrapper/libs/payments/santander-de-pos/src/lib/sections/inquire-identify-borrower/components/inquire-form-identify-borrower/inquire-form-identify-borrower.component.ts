import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';

import { ModeEnum } from '@pe/checkout/form-utils';
import { FormValue, IdentifyFormValue, PERSON_TYPE } from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-de-pos-inquire-form-identify-borrower',
  templateUrl: './inquire-form-identify-borrower.component.html',
  styleUrls: ['../../../identify.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class InquireFormIdentifyBorrowerComponent implements OnInit {
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() mode: ModeEnum;

  @Input() businessId: string;

  @Input() isExpandAll: boolean;

  @Output() submitted = new EventEmitter<any>();

  private readonly personType = inject(PERSON_TYPE);

  public formGroup = this.fb.group({
    _identifyForm: this.fb.control<IdentifyFormValue>(null),
  });

  public readonly options$ = this.store.select(PaymentState.options);

  private readonly flow = this.store.selectSnapshot(FlowState.flow);
  public readonly currency = this.flow.currency;

  constructor(
    private store: Store,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);

    this.formGroup.get('_identifyForm').patchValue(formData[this.personType]?._identifyForm);
  }

  public submit(): void {
    this.formGroupDirective.onSubmit(null);

    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    this.store.dispatch(new PatchFormState(
      {
        [this.personType]: {
          ...formData[this.personType],
          ...this.formGroup.value,
        },
      },
    ));
  }

  public onSubmit(): void {
    const { valid, value } = this.formGroup;
    if (valid) {
      this.submitted.emit(value._identifyForm);
    }
  }
}
