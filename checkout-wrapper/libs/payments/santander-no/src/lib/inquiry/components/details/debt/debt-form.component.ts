import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum, PaymentSpecificStatusEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

export interface DebtFormValue {
  totalDebt: number;
}

@Component({
  selector: 'santander-no-debt-form',
  templateUrl: './debt-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class DebtFormComponent extends CompositeForm<DebtFormValue> {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod!: PaymentMethodEnum;

  private store = this.injector.get(Store);

  private readonly paymentStatus = this.store
    .selectSnapshot(PaymentState.response)
    .payment.specificStatus;

  public formGroup = this.fb.group({
    totalDebt: [
      {
        disabled: this.paymentStatus !== PaymentSpecificStatusEnum.NEED_MORE_INFO_DTI,
        value: null,
      },
      [Validators.required, Validators.min(0)],
    ],
  });

  registerOnChange(fn: (value: DebtFormValue) => void): void {
    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.onTouch?.();
        fn({
          totalDebt: Number(value.totalDebt),
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
