import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';

import { ModeEnum } from '@pe/checkout/form-utils';
import { FormValue, PERSON_TYPE, PersonTypeEnum, PersonalFormValue } from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-de-pos-inquire-form-identify-guarantor',
  templateUrl: './inquire-form-identify-guarantor.component.html',
  styleUrls: ['../../../identify.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class InquireFormIdentifyGuarantorComponent {
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() mode: ModeEnum;

  @Input() businessId: string;

  @Input() isExpandAll: boolean;

  @Output() submitted = new EventEmitter<any>();

  public formGroup = this.fb.group({
    _identifyForm: [null],
  });

  public readonly options$ = this.store.select(PaymentState.options);

  private readonly flow = this.store.selectSnapshot(FlowState.flow);
  public readonly currency = this.flow.currency;

  constructor(
    @Inject(PERSON_TYPE) private personType: PersonTypeEnum,
    private store: Store,
    private fb: FormBuilder,
  ) {}

  public submit(): void {
    this.formGroupDirective.onSubmit(null);

    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    this.store.dispatch(new PatchFormState({
      [this.personType]: {
        ...formData[this.personType],
        ...this.formGroup.value,
      },
    }));
  }

  public onSubmit(): void {
    const { valid, value } = this.formGroup;
    if (valid) {
      this.submitted.emit(value._identifyForm as PersonalFormValue);
    }
  }
}
