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
import { map, takeUntil, tap } from 'rxjs/operators';

import { ModeEnum } from '@pe/checkout/form-utils';
import {
  BaseIncomeContainerComponent,
  FormValue,
  NO_EMPLOYMENT_PROFESSIONS,
  PersonTypeEnum,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { CustomElementService } from '@pe/checkout/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-de-pos-inquire-income-guarantor',
  templateUrl: './inquire-income-guarantor.component.html',
  styles: [`
  .mt-15 {
    margin-top: 15px;
  }
  `],
})
export class InquireIncomeGuarantorComponent extends BaseIncomeContainerComponent implements OnInit {
  protected customElementService = inject(CustomElementService);

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() public mode: ModeEnum;

  @Output() submitted = new EventEmitter<any>();

  public readonly modeEnum = ModeEnum;

  public readonly formGroup = this.fb.group({
    incomeForm: [null],
    employmentForm: [null],
    protectionForm: [null],
  });

  public readonly currency = this.store.selectSnapshot(FlowState.flow).currency;
  public readonly options$ = this.store.select(PaymentState.options);

  public loading$ = this.submitted.pipe(
    map(() => true),
  );

  public protectionFormEnabled$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    this.formGroup.patchValue(formData.guarantor);

    this.incomeService.cpiTariff$.pipe(
      tap((cpiTariff: number) => {
        cpiTariff
          && !this.merchantMode
            ? this.protectionFormEnabled$.next(true)
            : this.protectionFormEnabled$.next(false);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    const gProfession: string = formData.guarantor.personalForm?.profession;
    const noEmploymentGuarantor: boolean = NO_EMPLOYMENT_PROFESSIONS.indexOf(gProfession) >= 0;

    !noEmploymentGuarantor
      ? this.formGroup.get('employmentForm').enable()
      : this.formGroup.get('employmentForm').disable();
  }

  public submit(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    this.store.dispatch(new PatchFormState({
      [PersonTypeEnum.Guarantor]: {
        ...formData.guarantor,
        incomeForm: {
          ...formData.guarantor.incomeForm,
          ...this.formGroup.value.incomeForm,
        },
        employmentForm: {
          ...formData.guarantor.employmentForm,
          ...this.formGroup.value.employmentForm,
        },
        protectionForm: {
          ...formData.guarantor.protectionForm,
          ...this.formGroup.value.protectionForm,
        },
      },
    }));
    this.formGroupDirective.onSubmit(null);
  }

  public onSubmit(): void {
    const { valid, value } = this.formGroup;

    if (valid) {
      this.submitted.emit(value);
    }
  }
}
