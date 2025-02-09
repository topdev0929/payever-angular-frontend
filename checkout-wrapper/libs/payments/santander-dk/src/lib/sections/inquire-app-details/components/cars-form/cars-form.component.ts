import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import memoize from 'fast-memoize';
import { merge } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FormOptionInterface } from '@pe/checkout/types';
import { CurrencySymbolPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  CarsFormValue,
  DK_VALUES_TRANSLATIONS,
  FinancedTypeView,
  FormOptionsInterface,
  numberMaskFactory,
  numberUnmask,
} from '../../../../shared';

const MAX_COUNT = 20;

@Component({
  selector: 'cars-form',
  templateUrl: './cars-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    CurrencySymbolPipe,
  ],
})
export class CarsFormComponent extends CompositeForm<CarsFormValue> implements OnInit {

  private store = this.injector.get(Store);

  public formArray = this.fb.array<FormGroup>([]);
  public formGroup = this.fb.group({
    _count: this.fb.control<number>(
      null,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(MAX_COUNT),
      ],
    ),
    cars: this.formArray,
  });

  get controlsArray(): FormGroup[] {
    return this.formArray.controls as FormGroup[];
  }

  public currency = this.store.selectSnapshot(FlowState.flow).currency;
  public options$ = this.store.select(PaymentState.options).pipe(
    map((options: FormOptionsInterface) => {
      const entries = Object.entries({
        carsAges: options.carsAges,
        carsFinancedTypes: options.carsFinancedTypes,
      }).map(([key, values]) =>
        [
          key,
          values.map((option: FormOptionInterface, index: number) => {
            const labelLastFragment = option.label.split('.').slice(-1)[0];

            return {
              title: `santander-dk.${key}.${option.value}`,
              label: DK_VALUES_TRANSLATIONS[`santander-dk.${key}.${labelLastFragment}`],
              value: option.value,
              index,
            };
          }),
        ]
      );

      return Object.fromEntries(entries);
    }),
  );

  public readonly countUnmask = numberUnmask;
  public readonly countMask = numberMaskFactory(0, MAX_COUNT);

  ngOnInit(): void {
    super.ngOnInit();

    const childrenCountChanges$ = this.formGroup.get('_count').valueChanges.pipe(
      startWith(this.formGroup.get('_count').value),
      tap((count: number) => {
        const validCount = Math.min(count, MAX_COUNT);
        const currentCount = this.controlsArray.length;

        for (let i = validCount; i <= currentCount; i++) {
          this.formArray.removeAt(this.controlsArray.length - 1);
        }
        const alteredCount = this.controlsArray.length;
        if (alteredCount < validCount) {
          for (let i = alteredCount; i < validCount; i++) {
            this.createForm();
          }
        }
      }),
    );

    merge(
      childrenCountChanges$,
      this.formGroup.valueChanges.pipe(
        tap(value => this.store.dispatch(new PatchFormState({ carsForm: value }))),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private translate(i?: number) {
    return {
      finance_type: $localize `:@@santander-dk.inquiry.form.finance_type.label:${i}:index:`,
      age_of_car: $localize `:@@santander-dk.inquiry.form.age_of_car.label:${i}:index:`,
      monthly_expense: $localize `:@@santander-dk.inquiry.form.monthly_expense.label:`,
    };
  }

  public readonly translateMemo = memoize(this.translate.bind(this));

  public trackByIdx(index: number): number {
    return index;
  }

  private createForm(): void {
    const formGroup = this.fb.group({
      financedType: this.fb.control<string>(null, Validators.required),
      financedTypeView: this.fb.control<FinancedTypeView>(null, Validators.required),
      age: this.fb.control<number>(
        { disabled: true, value: null },
        [Validators.required],
      ),
      monthlyExpense: this.fb.control<number>(
        { disabled: true, value: null },
        [Validators.required, Validators.maxLength(9), Validators.min(0)],
      ),
    });
    this.formArray.push(formGroup);

    formGroup.get('financedTypeView').valueChanges.pipe(
      tap((financeTypeView) => {
        formGroup.get('age').disable();
        formGroup.get('monthlyExpense').disable();

        if (financeTypeView.index === 0) {
          formGroup.get('age').enable();

        }
        if (financeTypeView.index === 1) {
          formGroup.get('monthlyExpense').enable();

        }
        if (financeTypeView.index === 2) {
          formGroup.get('age').enable();
          formGroup.get('monthlyExpense').enable();
        }

        formGroup.get('financedType').setValue(financeTypeView.value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
