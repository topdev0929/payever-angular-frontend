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
import { Store } from '@ngxs/store';
import { NumberType } from 'libphonenumber-js';
import { merge } from 'rxjs';
import { map, auditTime, takeUntil, tap, distinctUntilChanged, filter, take } from 'rxjs/operators';

import { TrackingService } from '@pe/checkout/api';
import { ModeEnum } from '@pe/checkout/form-utils';
import { PhoneValidators } from '@pe/checkout/forms/phone';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { ExtraMapperService } from '../../../../shared/services';
import {
  EMPLOYMENT_NOT_WORKING,
  EmploymentChoice,
  FormValue,
  PERSON_TYPE,
  PersonTypeEnum,
} from '../../../../shared/types';

@Component({
  selector: 'first-step-borrower',
  templateUrl: './first-step-borrower.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class FirstStepBorrowerFormComponent implements OnInit {

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() mode: ModeEnum;

  @Output() submitted = new EventEmitter<any>();

  public readonly formGroup = this.fb.group({
    personalForm: [null],
    employmentForm: [null],
  });

  private flow = this.store.selectSnapshot(FlowState.flow);
  private paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);

  public loading$ = this.submitted.pipe(
    map(() => true),
  );

  public readonly translations = {
    buttonText: $localize`:@@actions.continue:`,
  };

  public readonly modeEnum = ModeEnum;

  constructor(
    @Inject(PERSON_TYPE) private personType: PersonTypeEnum,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private fb: FormBuilder,
    private readonly extraMapper: ExtraMapperService,
    private destroy$: PeDestroyService,
    private trackingService: TrackingService,
  ) { }

  ngOnInit(): void {
    const formData$ = this.store.selectOnce<FormValue>(PaymentState.form).pipe(
      filter(v => Boolean(v)),
      take(1),
      tap((formData) => {
        const extra = this.extraMapper.map(this.flow.extra);
        this.formGroup.patchValue({
          ...extra,
          ...extra.customer || {},
          ...formData[this.personType] ?? {},
          personalForm: {
            ...extra[this.personType]?.personalForm ?? {},
            ...extra[this.personType]?.employmentForm ?? {},
            addressLandlinePhone:
              this.isPhoneTypeMatches(this.flow.billingAddress?.phone, 'FIXED_LINE')
                ? this.flow.billingAddress?.phone : '',
            addressCellPhone:
              this.isPhoneTypeMatches(this.flow.billingAddress?.phone, 'MOBILE')
              ? this.flow.billingAddress?.phone : '',
            ...formData[this.personType]?.personalForm ?? {},
          },
        });
      })
    );

    const employment$ = this.store.select<FormValue>(PaymentState.form).pipe(
      map(value => value?.[this.personType]?.personalForm?.employment),
      filter(v => Boolean(v)),
      distinctUntilChanged(),
      tap((employment) => {
        EMPLOYMENT_NOT_WORKING.includes(employment as EmploymentChoice)
          ? this.formGroup.get('employmentForm').disable()
          : this.formGroup.get('employmentForm').enable();

        this.cdr.detectChanges();
      }),
    );

    const valueChanges$ = this.formGroup.valueChanges.pipe(
      auditTime(300),
      tap((value) => {
        const formData: FormValue = this.store.selectSnapshot<FormValue>(PaymentState.form);
        this.store.dispatch(new PatchFormState({
          [this.personType]: {
            ...formData[this.personType],
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
    const { value } = this.formGroup;
    const valid = Object.values(this.formGroup.controls)
      .every(c => c.disabled || c.valid || c.value._isValid);

    this.formGroupDirective.onSubmit(null);

    if (valid) {
      this.trackingService.doEmitCustomEvent(this.flow.id, this.paymentMethod, 'customer_form1_step_passed');
      this.submitted.emit(value);
    }
  }

  private isPhoneTypeMatches(phoneNumber: string, type: NumberType): boolean {
    const parsed = phoneNumber && PhoneValidators.parsePhone(phoneNumber);

    return parsed && parsed.getType() === type;
  }
}
