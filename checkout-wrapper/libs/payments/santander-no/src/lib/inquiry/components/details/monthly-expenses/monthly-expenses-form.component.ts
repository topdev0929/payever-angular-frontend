import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

interface MonthlyExpensesFormValue {
  otherMonthlyExpenses: number;
}

@Component({
  selector: 'santander-no-monthly-expenses-form',
  templateUrl: './monthly-expenses-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  styles: [`
    .santander-no-monthly-expenses-form {
      overflow: hidden;
    }
  `],
})
export class MonthlyExpensesFormComponent extends CompositeForm<MonthlyExpensesFormValue> {

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  public readonly currency = this.flow.currency;
  public formGroup = this.fb.group({
    otherMonthlyExpenses: this.fb.control<number>(null, [Validators.required]),
  });

  registerOnChange(fn: (value: MonthlyExpensesFormValue) => void): void {
    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.onTouch?.();
        fn({
          otherMonthlyExpenses: Number(value.otherMonthlyExpenses),
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
