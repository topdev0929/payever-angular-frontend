import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { UtilStepService } from '../../../../services';
import { ACCOMMODATION_TYPE, HouseholdFormValue } from '../../../../shared';

const HOUSING_COST_MIN = 0;
const HOUSING_COST_MAX = 999_999;

@Component({
  selector: 'household-form',
  templateUrl: './household-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdFormComponent extends CompositeForm<HouseholdFormValue> {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;
  @Select(PaymentState.options) private options$!: Observable<any>;

  private utilStepService = this.injector.get(UtilStepService);

  public readonly formGroup = this.fb.group({
    accommodationType: this.fb.control(null, Validators.required),
    housingCostPerMonth: this.fb.control(
      null,
      [Validators.required, Validators.min(HOUSING_COST_MIN), Validators.max(HOUSING_COST_MAX)],
    ),
    numberOfChildren: this.fb.control<number>(null, Validators.required),
  });


  public accommodationTypeOptions$ = this.options$.pipe(
    map(options => this.utilStepService.translateOptions(options.accommodationType, ACCOMMODATION_TYPE)),
  );
}
