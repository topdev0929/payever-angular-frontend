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
import { Actions, ofActionCompleted, ofActionDispatched, Select, Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModeEnum } from '@pe/checkout/form-utils';
import {
  AddressFormValue,
  FormValue,
  PERSON_TYPE,
  PersonTypeEnum,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, OpenNextStep, ParamsState, PatchFlow, PatchFormState, PaymentState } from '@pe/checkout/store';
import { CheckoutStateParamsInterface, PaymentMethodEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-de-pos-form-address-borrower',
  templateUrl: './inquire-form-address-borrower.component.html',
})
export class InquireFormAddressBorrowerComponent implements OnInit {

  @Select(ParamsState.params) private params$!: Observable<CheckoutStateParamsInterface>;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() isExpandAll: boolean;

  @Input() mode: ModeEnum;

  @Output() continue = new EventEmitter<void>();

  @Output() submitted = new EventEmitter<any>();

  public readonly options$ = this.store.select(PaymentState.options);

  public readonly formGroup = this.fb.group({
    billingAddress: [null],
  });

  public addressParams$ = this.params$.pipe(
    map(({
      forceCodeForPhoneRequired,
      forcePhoneRequired,
    }) => ({
      forceAddressOnlyFillEmptyAllowed: false,
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
  ) {}

  ngOnInit(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    const customerAddress = formData?.customer.addressForm ?? {} as AddressFormValue;
    this.formGroup.get('billingAddress').setValue({
      ...customerAddress,
    });
  }

  submit(): void {
    const { valid } = this.formGroup;
    this.formGroupDirective.onSubmit(null);

    if (valid) {
      const payload = {
        billingAddress: {
          ...this.formGroup.getRawValue().billingAddress,
          country: 'DE',
        },
      };
      const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
      this.store.dispatch(new PatchFormState({
        [this.personType]: {
          ...formData[this.personType],
          addressform: {
            ...formData[this.personType]?.addressForm,
            ...payload.billingAddress,
          },
        },
      }));

      this.store.dispatch(new PatchFlow(payload));
    }
  }

  public onSubmit(): void {
    const { valid, value } = this.formGroup;
    if (valid) {
      this.submitted.emit(value.billingAddress);
    }
  }
}
