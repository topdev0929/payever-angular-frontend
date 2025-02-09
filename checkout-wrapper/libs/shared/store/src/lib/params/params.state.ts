import { Injectable } from '@angular/core';
import { Action, Selector, SelectorOptions, State, StateContext } from '@ngxs/store';

import { CheckoutStateParamsInterface } from '@pe/checkout/types';

import { PatchParams, SetParams } from './params.actions';

@State<CheckoutStateParamsInterface>({
  name: 'params',
  defaults: {},
})
@SelectorOptions({
  injectContainerState: false,
  suppressErrors: false,
})
@Injectable()
export class ParamsState {

  @Selector() static params(state: CheckoutStateParamsInterface) {
    return state;
  }

  @Selector() static merchantMode(state: CheckoutStateParamsInterface) {
    return state.merchantMode;
  }

  @Selector() static embeddedMode(state: CheckoutStateParamsInterface) {
    return state.embeddedMode;
  }

  @Selector() static editMode(state: CheckoutStateParamsInterface) {
    return state.editMode;
  }

  @Action(SetParams)
  setParams({ setState }: StateContext<CheckoutStateParamsInterface>, action: SetParams) {
    setState({ ...action.payload });
  }

  @Action(PatchParams)
  patchParams({ patchState }: StateContext<CheckoutStateParamsInterface>, action: SetParams) {
    patchState({ ...action.payload });
  }
}
