import { Directive, Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngxs/store';

import { FlowState, ParamsState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { IncomeService } from '../services';




@Directive()
export abstract class BaseIncomeContainerComponent {
  public incomeService = this.injector.get(IncomeService);

  protected store = this.injector.get(Store);
  protected destroy$ = this.injector.get(PeDestroyService);
  protected fb = this.injector.get(FormBuilder);

  protected readonly flow = this.store.selectSnapshot(FlowState.flow);
  protected readonly merchantMode = this.store.selectSnapshot(ParamsState.merchantMode);
  protected readonly paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);

  constructor(
    protected injector: Injector
  ) { }
}
