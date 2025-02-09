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
import { Actions, Select, Store, ofActionCompleted, ofActionDispatched } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModeEnum } from '@pe/checkout/form-utils';
import {
  AddressFormValue,
  FormValue,
  PERSON_TYPE,
  PersonTypeEnum,
  mapGuarantorAddress,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, OpenNextStep, ParamsState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { CheckoutStateParamsInterface, PaymentMethodEnum } from '@pe/checkout/types';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-de-pos-inquire-form-address-guarantor',
  templateUrl: './inquire-form-address-guarantor.component.html',
})
export class InquireFormAddressGuarantorComponent implements OnInit {
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @Select(ParamsState.params) private params$!: Observable<CheckoutStateParamsInterface>;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() isExpandAll: boolean;

  @Input() mode: ModeEnum;

  @Output() continue = new EventEmitter<void>();

  @Output() submitted = new EventEmitter<any>();

  public readonly modeEnum = ModeEnum;

  public readonly options$ = this.store.select(PaymentState.options);

  public readonly formGroup = this.fb.group({
    addressForm: [null],
  });

  public addressParams$ = this.params$.pipe(
    map(({
      forceAddressOnlyFillEmptyAllowed,
      forceCodeForPhoneRequired,
      forcePhoneRequired,
    }) => ({
      forceAddressOnlyFillEmptyAllowed,
      forceCodeForPhoneRequired,
      forcePhoneRequired,
    })),
  );

  public loading$ = merge(
    this.actions$.pipe(
      ofActionDispatched(OpenNextStep),
      map(() => true),
    ),
    this.actions$.pipe(
      ofActionCompleted(OpenNextStep),
      map(() => false),
    ),
  );

  constructor(
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    @Inject(PERSON_TYPE) private personType: PersonTypeEnum,
  ) { }

  ngOnInit(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);

    const guarantorAddress = formData?.guarantor.addressForm ?? {} as AddressFormValue;

    this.formGroup.get('addressForm').patchValue({
      ...guarantorAddress,
    });
  }

  submit(): void {
    this.formGroupDirective.onSubmit(null);
  }

  public onSubmit(): void {
    const { valid, value } = this.formGroup;
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);

    if (valid) {
      this.store.dispatch(new PatchFormState({
        [this.personType]: {
          ...formData[this.personType],
          addressForm: value.addressForm,
        },
      }));
      this.submitted.emit(mapGuarantorAddress(value.addressForm));
    }
  }
}
