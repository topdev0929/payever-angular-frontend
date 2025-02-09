import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { ModeEnum } from '@pe/checkout/form-utils';
import {
  FormValue,
  PERSON_TYPE,
  PersonTypeEnum,
  TogglePrevAddressEventInterface,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-de-pos-inquire-form-personal-info-borrower',
  styles: [
    `
    .mt-15 {
      margin-top: 15px;
    }
    `,
  ],
  templateUrl: './inquire-form-personal-info-borrower.component.html',
  providers: [
    PeDestroyService,
  ],
})
export class InquireFormPersonalInfoBorrowerComponent implements OnInit {
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() mode: ModeEnum;

  @Input() businessId: string;

  @Input() isExpandAll: boolean;

  @Output() submitted = new EventEmitter<any>();


  public readonly modeEnum = ModeEnum;

  public readonly options$ = this.store.select(PaymentState.options);

  public readonly currency = this.store.selectSnapshot(FlowState.flow).currency;

  public readonly formGroup = this.fb.group({
    personalForm: [null],
    prevAddressForm: [{ disabled: true, value: null }],
    bankForm: [null],
  });

  public readonly addressResidentSince$ = new BehaviorSubject(null);

  constructor(
    @Inject(PERSON_TYPE) public personType: PersonTypeEnum,
    private store: Store,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
  ) { }


  ngOnInit(): void {
    const formData$ = this.store.selectOnce(PaymentState.form);

    formData$.pipe(
      filter(formData => !!formData[this.personType]),
      tap(formData => this.formGroup.patchValue({
        ...formData[this.personType],
        personalForm: {
          ...formData[this.personType]._identifyForm,
          ...formData[this.personType].personalForm,
        },
        prevAddressForm: {
          ...formData[this.personType].prevAddressForm,
          ...this.formGroup.value.prevAddressForm,
        },
      })),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  togglePrevAddress(event: TogglePrevAddressEventInterface): void {
    const { date, isPrevAddress } = event;
    this.addressResidentSince$.next(date);
    isPrevAddress
      ? this.formGroup.get('prevAddressForm').enable()
      : this.formGroup.get('prevAddressForm').disable();
  }

  submit(): void {
    this.formGroupDirective?.onSubmit(null);
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    this.store.dispatch(new PatchFormState({
      [this.personType]: {
        ...formData[this.personType],
        personalForm: {
          ...formData[this.personType].personalForm,
          ...this.formGroup.value.personalForm,
        },
        prevAddressForm: {
          ...formData[this.personType].prevAddressForm,
          ...this.formGroup.value.prevAddressForm,
        },
        bankForm: {
          ...formData[this.personType].bankForm,
          ...this.formGroup.value.bankForm,
        },
      },
    }));
  }

  onSubmit(): void {
    const { valid, value } = this.formGroup;

    if (valid) {
      this.submitted.emit(value);
    }
  }
}
