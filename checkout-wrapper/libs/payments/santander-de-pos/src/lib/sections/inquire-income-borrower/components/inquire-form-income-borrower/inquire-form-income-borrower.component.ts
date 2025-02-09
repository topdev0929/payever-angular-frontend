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
import { FormGroupDirective } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ModeEnum } from '@pe/checkout/form-utils';
import {
  BaseIncomeContainerComponent,
  FormValue,
  GuarantorRelation,
  NO_EMPLOYMENT_PROFESSIONS,
  PERSON_TYPE,
  PersonFormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { CustomElementService } from '@pe/checkout/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-de-pos-inquire-form-income-borrower',
  templateUrl: './inquire-form-income-borrower.component.html',
})
export class InquireFormIncomeBorrowerComponent extends BaseIncomeContainerComponent implements OnInit {

  protected customElementService = inject(CustomElementService);
  private readonly personType = inject(PERSON_TYPE);

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() public mode: ModeEnum;
  @Input() isLastStep = false;
  @Input() isExpandAll: boolean;

  @Output() submitted = new EventEmitter<FormValue>();

  public readonly modeEnum = ModeEnum;

  public readonly currency = this.store.selectSnapshot(FlowState.flow).currency;
  public readonly options$ = this.store.select(PaymentState.options);
  public readonly formData$ = this.store.select(PaymentState.form);

  public loading$ = this.submitted.pipe(
    map(() => true),
  );

  public readonly formGroup = this.fb.group({
    incomeForm: [null],
    employmentForm: [null],
    protectionForm: [null],
  });

  public readonly transactions = {
    continue: $localize`:@@checkout_sdk.action.continue:`,
    submit: $localize`:@@checkout_sdk.action.submit_application:`,
  };

  public protectionFormEnabled$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    const formData: PersonFormValue = this.store
      .selectSnapshot(PaymentState.form)[this.personType];
    this.formGroup.patchValue(formData);

    this.incomeService.cpiTariff$.pipe(
      switchMap(cpiTariff => this.formData$.pipe(
        tap((formData: FormValue) => {
          const guarantorRelation = formData?.detailsForm?.typeOfGuarantorRelation;

          !!cpiTariff
            && (!guarantorRelation || guarantorRelation == GuarantorRelation.NONE)
            && !this.merchantMode
              ? this.protectionFormEnabled$.next(true)
              : this.protectionFormEnabled$.next(false);
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();

    const cProfession: string = formData.personalForm?.profession;
    const noEmploymentCustomer: boolean = NO_EMPLOYMENT_PROFESSIONS.indexOf(cProfession) >= 0;

    !noEmploymentCustomer
      ? this.formGroup.get('employmentForm').enable()
      : this.formGroup.get('employmentForm').disable();
  }

  public submit(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);

    this.store.dispatch(new PatchFormState({
      [this.personType]: {
        ...formData[this.personType],
        incomeForm: {
          ...formData?.[this.personType]?.incomeForm,
          ...this.formGroup.value.incomeForm,
        },
        employmentForm: {
          ...formData?.[this.personType]?.employmentForm,
          ...this.formGroup.value.employmentForm,
        },
        protectionForm: {
          ...formData?.[this.personType]?.protectionForm,
          ...this.formGroup.value.protectionForm,
        },
      },
    }));

    this.formGroupDirective.onSubmit(null);
  }

  public onSubmit(): void {
    const { valid, value } = this.formGroup;

    if (valid) {
      this.submitted.emit(value as FormValue);
    }
  }
}
