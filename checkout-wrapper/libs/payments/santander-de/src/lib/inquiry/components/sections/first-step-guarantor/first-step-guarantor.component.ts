import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { map, takeUntil, tap, distinctUntilChanged, filter, take } from 'rxjs/operators';

import { TrackingService } from '@pe/checkout/api';
import { ModeEnum } from '@pe/checkout/form-utils';
import { FlowState, ParamsState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { CheckoutStateParamsInterface, PaymentAddressSettingsInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  EMPLOYMENT_NOT_WORKING,
  EmploymentChoice,
  FormValue,
  GuarantorRelation,
  PERSON_TYPE,
  PersonTypeEnum,
} from '../../../../shared/types';

@Component({
  selector: 'first-step-guarantor',
  templateUrl: './first-step-guarantor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class FirstStepGuarantorFormComponent implements OnInit {

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() mode: ModeEnum;

  @Output() submitted = new EventEmitter<any>();

  public readonly formGroup = this.fb.group({
    personalForm: [null],
    employmentForm: [null],
    addressForm: [null],
  });

  private flow = this.store.selectSnapshot(FlowState.flow);
  @Select(ParamsState.params) private params$!: Observable<CheckoutStateParamsInterface>;

  private paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);

  public loading$ = this.submitted.pipe(
    map(() => true),
  );

  public readonly translations = {
    buttonText: $localize`:@@actions.continue:`,
  };

  public readonly modeEnum = ModeEnum;
  public readonly guarantorRelationEnum = GuarantorRelation;
  public readonly guarantorRelation = this.store.selectSnapshot<FormValue>(PaymentState.form)
    .customer.personalForm.typeOfGuarantorRelation;

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

  public addressSettings: PaymentAddressSettingsInterface = {
    isPhoneFieldHidden: true,
    phonePattern: null,
    phonePatternCodeRequired: null,
    codeRequired: false,
    postalCodePattern: null,
    countryCode: null,
  };

  constructor(
    @Inject(PERSON_TYPE) private personType: PersonTypeEnum,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
    private trackingService: TrackingService,
  ) { }

  ngOnInit(): void {
    this.personType !== PersonTypeEnum.Guarantor
      ? this.formGroup.get('addressForm').disable()
      : this.formGroup.get('addressForm').enable();

    const formData$ = this.store.selectOnce<FormValue>(PaymentState.form).pipe(
      filter(v => Boolean(v)),
      take(1),
      tap((formData) => {
        this.formGroup.patchValue({
          ...formData?.[this.personType] ?? {},
        });
      })
    );

    const employment$ = this.store.select<FormValue>(PaymentState.form).pipe(
      filter(v => Boolean(v)),
      map(value => value[this.personType]?.personalForm?.employment),
      distinctUntilChanged(),
      tap((employment) => {
        EMPLOYMENT_NOT_WORKING.includes(employment as EmploymentChoice)
          ? this.formGroup.get('employmentForm').disable()
          : this.formGroup.get('employmentForm').enable();

        this.cdr.detectChanges();
      }),
    );

    const valueChanges$ = this.formGroup.valueChanges.pipe(
      tap((value) => {
        const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
        this.store.dispatch(new PatchFormState({
          [this.personType]: {
            ...formData?.[this.personType] ?? {},
            ...value,
          },
        }));
      }),
    );

    merge(
      employment$,
      formData$,
      valueChanges$
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onContinue(): void {
    const { valid, value } = this.formGroup;
    this.formGroupDirective.onSubmit(null);

    if (valid) {
      this.trackingService.doEmitCustomEvent(this.flow.id, this.paymentMethod, 'customer_form1_step_passed');
      this.submitted.emit(value);
    }
  }
}
