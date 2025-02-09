import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { CurrencySymbolPipe } from '@pe/checkout/utils';

import { UtilStepService } from '../../../../services';
import { PersonalFormValue } from '../../../../shared';

const MONTHLY_INCOME_MIN = 0;
const MONTHLY_INCOME_MAX = 999_999;

@Component({
  selector: 'personal-form',
  templateUrl: './personal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencySymbolPipe],
})
export class PersonalFormComponent extends CompositeForm<PersonalFormValue> {
  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;

  @Select(PaymentState.options)
  private options$!: Observable<any>;

  private readonly store = inject(Store);
  private utilStepService = this.injector.get(UtilStepService);

  public readonly formGroup = this.fb.group({
    monthlyGrossIncome: this.fb.control(
      null,
      [Validators.required, Validators.min(MONTHLY_INCOME_MIN), Validators.max(MONTHLY_INCOME_MAX)],
    ),
    citizenship: [null, Validators.required],
    citizenshipSecond: [null],
  });

  public currency = this.store.selectSnapshot(FlowState.flow).currency;

  public citizenshipOptions$ = this.options$.pipe(
    switchMap(options => this.utilStepService.getCountries(false, options)),
    shareReplay(1),
  );
}
